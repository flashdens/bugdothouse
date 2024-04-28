import json

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

import chess
from channels.layers import get_channel_layer
from django.shortcuts import redirect, get_object_or_404

from game.models import Game, Move, User


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
            return 'w'
        elif game.black_player is None or game.black_player.pk == user.pk:
            game.black_player = user
            return 'b'
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

    @sync_to_async
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

    @database_sync_to_async
    def process_move_in_db(self, data):
        try:
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')

            game = get_object_or_404(Game, pk=1)

            move = chess.Move.from_uci(from_sq + to_sq)
            board = chess.Board(fen=game.fen)
            is_move_valid = True if move in board.legal_moves else False

            if is_move_valid:
                board.push(move)

            print(board)

            game.side_to_move = 'b' if game.side_to_move == 'w' else 'b'
            game.fen = board.fen()
            game.save()

            db_move = Move(game=game,
                           player="TEST",
                           move=move,
                           )
            db_move.save()

            response_data = {
                'type': 'move',
                'error': 'Invalid move' if not is_move_valid else None,
                'game_over': self.handle_game_ending_move(),
                'side_to_move': game.side_to_move,
                'fen': board.fen()
            }

            print("received", from_sq + to_sq, "over websocket, success:", is_move_valid)
            return response_data

        except json.JSONDecodeError:
            return {'type': 'error', 'message': 'invalid json'}

    async def handle_move(self, data):
        response_data = await self.process_move_in_db(data)
        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'game.move', 'message': response_data}
        )

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
        await self.send(json.dumps({'message': move}))
