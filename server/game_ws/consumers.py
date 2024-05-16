import json
import re
from collections import Counter

import jwt
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

import chess
import chess.variant

from django.shortcuts import get_object_or_404

from bugdothouse_server import settings
from game.models import Game, Move
from authorization.models import User


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.players = []
        super().__init__(*args, **kwargs)

    async def connect(self):
        self.room_group_name = "game"
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    @sync_to_async
    def determine_side(self, game, user):
        if game.white_player is None or game.white_player.pk == user.pk:
            game.white_player = user
            return 'WHITE'
        elif game.black_player is None or game.black_player.pk == user.pk:
            game.black_player = user
            return 'BLACK'
        else:
            print("spectator")  # todo
            return None

    async def handle_connect(self, data):
        username = data.get('username')
        uuid = data.get('uuid')
        print(username, "connected")
        user = await sync_to_async(get_object_or_404)(User, username=username)

        if user.uuid != uuid:
            print("masz przejebane")

        game = await sync_to_async(get_object_or_404)(Game, pk=1)
        player_side = await self.determine_side(game, user)

        await game.asave()

        await self.send(text_data=json.dumps({'type': 'connection_response',
                                              'message': 'Connected successfully',
                                              'side': player_side}))

    # is nesting async functions even a good idea?
    '''
    def handle_game_ending_move(self, board):
        if board.is_stalemate():
            return 'Stalemate'
        elif board.is_checkmate():
            return 'Win by checkmate!'
        elif board.is_insufficient_material():
            return 'Draw by insufficient material'
        elif board.is_seventyfive_moves():
            return 'Draw by seventy-five moves rule'
        elif board.is_fivefold_repetition():
            return 'Draw by fivefold repetition'
        else:
            return None
        '''


    async def process_move_in_db(self, data):
        try:
            token = data.get('token')
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            piece = data.get('piece')
            promotion = data.get('promotion')

            # Decode JWT token
            try:
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_token.get('user_id')
            except jwt.ExpiredSignatureError:
                return False, {'type': 'error', 'error': 'Token has expired'}
            except jwt.InvalidTokenError:
                return False, {'type': 'error', 'error': 'Invalid token'}

            # Authenticate the user
            user = await sync_to_async(get_object_or_404)(User, id=user_id)

            game = await sync_to_async(get_object_or_404)(Game, pk=1)

            board = chess.variant.CrazyhouseBoard(fen=game.fen)

            player = game.white_player if board.turn == chess.WHITE else game.black_player

            # Check if the authenticated user is the player to move
            if user != player:
                return False, {'type': 'error', 'error': "You're not the player to move"}

            if from_sq:  # move from board
                move = chess.Move.from_uci(from_sq + to_sq + (promotion if promotion else ''))
                is_move_valid = move in board.legal_moves
            else:  # move from pocket
                move = chess.Move.from_uci((piece.upper() if game.side_to_move else piece.lower()) + '@' + to_sq)
                is_move_valid = chess.parse_square(to_sq) in board.legal_drop_squares() and move in board.legal_moves

            if is_move_valid:
                board.push(move)
            else:
                return False, {'type': 'error', 'error': 'Invalid move'}

            game.side_to_move = board.turn
            game.fen = board.fen()
            await sync_to_async(game.save)()

            db_move = Move(game=game, player=player, move=move)
            await sync_to_async(db_move.save)()

            pockets = re.sub(r'^.*?\[(.*?)].*$', r'\1', game.fen)  # Extract the pocket information
            no_pocket_fen = re.sub(r'\[.*?]', '', game.fen).replace('[]', '')  # Remove the pockets from the FEN string

            response_data = {
                'type': 'move',
                "fen": no_pocket_fen.replace('~', ''),  # Remove tildes from Crazyhouse string
                "whitePocket": dict(Counter([p for p in pockets if p.isupper()])),
                "blackPocket": dict(Counter([p for p in pockets if p.islower()])),
                "sideToMove": game.side_to_move,
                "gameOver": 'Checkmate' if chess.variant.CrazyhouseBoard(fen=game.fen).is_checkmate() else None,
            }

            return True, response_data

        except json.JSONDecodeError:
            return False, {'type': 'error', 'error': 'Invalid JSON'}
        except Exception as e:
            return False, {'type': 'error', 'error': str(e)}

    async def handle_move(self, data):
        success, response_data = await self.process_move_in_db(data)
        if success:
            await self.channel_layer.group_send(
                self.room_group_name, {'type': 'game.move', 'message': response_data})
        else:
            await self.send(json.dumps(response_data))

    async def receive(self, text_data=None, bytes_data=None):
        print(text_data)
        try:
            data = json.loads(text_data)
            event_type = data['type']
            print(event_type)
            if event_type == 'connect':
                await self.handle_connect(data)
            elif event_type == 'move':
                await self.handle_move(data)
            else:
                await self.send(text_data=json.dumps({'message': 'invalid request received'}))
                pass

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'message': 'invalid json'}))

    async def game_move(self, event):
        move = event['message']
        await self.send(json.dumps(move))
