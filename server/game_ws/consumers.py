import json
import re
import traceback
from enum import Enum
from collections import Counter

import jwt
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

import chess
import chess.variant

from django.shortcuts import get_object_or_404

from bugdothouse_server import settings
from game.models import Game, Move, GameStatus
from authorization.models import User


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.players = []
        super().__init__(*args, **kwargs)

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["game_code"]
        self.room_group_name = f"lobby_{self.room_name}"
        print('connected')
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        print('disconnected')
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

    async def parse_jwt_token_async(self, token):
        try:
            decoded_token = await sync_to_async(jwt.decode)(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return False, {'type': 'error', 'error': 'Token has expired'}
        except jwt.InvalidTokenError:
            return False, {'type': 'error', 'error': 'Invalid token'}

        return decoded_token

    async def process_move(self, data):
        try:
            token = data.get('token')
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            piece = data.get('piece')
            code = data.get('code')
            promotion = data.get('promotion')
            subgame = data.get('subgame')
            decoded_token = await self.parse_jwt_token_async(token)
            user_id = decoded_token['user_id']

            # Authenticate the user
            user = await sync_to_async(get_object_or_404)(User, id=user_id)

            game = await sync_to_async(get_object_or_404)(Game, code=code, subgame_id=subgame)

            if game.status != GameStatus.ONGOING.value:
                return False, {'type': 'error', 'error': "Game is not going on"}

            board = chess.variant.CrazyhouseBoard(fen=game.fen)

            player = await sync_to_async(
                lambda: game.white_player if board.turn == chess.WHITE else game.black_player)()

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
            traceback.print_exc()
            return False, {'type': 'error', 'error': str(e)}

    async def handle_move(self, data):
        success, response_data = await self.process_move(data)
        if success:
            await self.channel_layer.group_send(
                self.room_group_name, {'type': 'game.move', 'message': response_data})
        else:
            await self.send(json.dumps(response_data))

    class PlayerRoles(Enum):
        WHITE_PLAYER = 0
        BLACK_PLAYER = 1
        SPECTATOR = 2

    async def get_game(self, room_name, subgame):
        return await database_sync_to_async(get_object_or_404)(Game, code=room_name, subgame_id=subgame)

    async def get_user(self, user_id):
        return await database_sync_to_async(get_object_or_404)(User, id=user_id)

    @sync_to_async
    def check_user_in_game_sync(self, game, user):
        return user in game.spectators.all() or game.white_player == user or game.black_player == user

    async def check_user_in_game(self, game, user):
        return await self.check_user_in_game_sync(game, user)

    @sync_to_async
    def remove_user_from_game_sync(self, user, game, from_side):
        if game.white_player is not None and game.white_player.pk == user.pk and from_side == self.PlayerRoles.WHITE_PLAYER.value:
            game.white_player = None

        elif game.black_player is not None and game.black_player.pk == user.pk and from_side == self.PlayerRoles.BLACK_PLAYER.value:
            game.black_player = None

        elif user in game.spectators.all() and from_side == self.PlayerRoles.SPECTATOR.value:
            game.spectators.remove(user)

        game.save()

    async def remove_user_from_game(self, user, game, from_side):
        await self.remove_user_from_game_sync(user, game, from_side)

    async def add_user_to_game(self, user, game, to_side):
        if await sync_to_async(lambda: game.white_player is None)() and to_side == self.PlayerRoles.WHITE_PLAYER.value:
            await sync_to_async(setattr)(game, 'white_player', user)
        elif await sync_to_async(lambda: game.black_player is None)() and to_side == self.PlayerRoles.BLACK_PLAYER.value:
            await sync_to_async(setattr)(game, 'black_player', user)
        elif to_side == self.PlayerRoles.SPECTATOR.value:
            await sync_to_async(game.spectators.add)(user)

    async def switch_user_positions(self, user, src_game, dest_game, from_side, to_side):
        if src_game.pk == dest_game.pk:
            dest_game = src_game

        await self.remove_user_from_game(user, src_game, from_side)
        await self.add_user_to_game(user, dest_game, to_side)

        await sync_to_async(src_game.save)()
        if src_game.pk != dest_game.pk:
            await sync_to_async(dest_game.save)()

    async def handle_user_switch(self, data):
        from_subgame = data['fromSubgame']
        from_side = data['fromSide']
        to_subgame = data['toSubgame']
        to_side = data['toSide']
        token = data['token']

        src_game = await self.get_game(self.room_name, from_subgame)
        dest_game = await self.get_game(self.room_name, to_subgame)

        if src_game.status != GameStatus.WAITING_FOR_START.value:
            return False, {'type': 'error', 'error': 'Game has already started'}

        decoded_token = await self.parse_jwt_token_async(token)
        user_id = decoded_token['user_id']

        user = await self.get_user(user_id)
        user_in_game = await self.check_user_in_game(src_game, user)

        if not user_in_game:
            return False, 'co ty tutaj robisz'

        await self.switch_user_positions(user, src_game, dest_game, from_side, to_side)
        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'lobby.switch', 'message': {'success': True}})

    async def handle_ai_player_action(self, data):
        event = data['event']
        subgame = data['toSubgame']
        side = data['toSide']
        token = data['token']

        decoded_token = await self.parse_jwt_token_async(token)
        user_id = decoded_token['user_id']

        user = await self.get_user(user_id)
        game = await self.get_game(self.room_name, subgame)
        host = await database_sync_to_async(getattr)(game, 'host')
        host = await self.get_user(host.pk)

        if user.pk != host.pk:
            return False, {'type': 'error', 'error': 'Only hosts can add AI players!'}

        ai_player = await database_sync_to_async(get_object_or_404)(User, username='bugdothouse_ai')
        if event == 'aiAdd':
            await self.add_user_to_game(ai_player, game, side)
        elif event == 'aiRemove':
            await self.remove_user_from_game(ai_player, game, side)
        await game.asave()

        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'lobby.connect'})

        return True

    async def receive(self, text_data=None, bytes_data=None):
        print(text_data)
        try:
            data = json.loads(text_data)
            event_type = data['type']
            if event_type == 'move':
                await self.handle_move(data)
            elif event_type == 'lobbySwitch':
                await self.handle_user_switch(data)
            elif event_type == 'lobbyAI':
                await self.handle_ai_player_action(data)
            elif event_type == 'connect':
                print('click')
                await self.channel_layer.group_send(
                    self.room_group_name, {'type': 'lobby.connect'})
            elif event_type == 'gameStart':
                await self.channel_layer.group_send(
                    self.room_group_name, {'type': 'game.start'})
            else:
                await self.send(text_data=json.dumps({'message': 'invalid request received'}))
                pass

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'message': 'invalid json'}))

    async def game_move(self, event):
        move = event['message']
        await self.send(json.dumps(move))

    async def lobby_switch(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"type": "lobbySwitch",
                                              "success": True}))

    async def lobby_connect(self, event):
        await self.send(text_data=json.dumps({"type": "connect"}))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({"type": "gameStart"}))
