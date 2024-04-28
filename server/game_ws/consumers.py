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

    @database_sync_to_async
    def parse_move(self, data):
        try:
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            side_to_move = data.get('sideToMove')

            game = get_object_or_404(Game, pk=1)

            success = False
            move = chess.Move.from_uci(from_sq + to_sq)
            board = chess.Board(fen=game.fen)

            if move in board.legal_moves:
                success = True
                board.push(move)

            print(board)

            game.side_to_move = not game.side_to_move
            game.fen = board.fen()
            game.save()

            db_move = Move(game=game,
                           player="TEST",
                           move=move,
                           # side_to_move='b' if side_to_move == 'w' else 'b'
                           )
            db_move.save()

            response_data = {
                'type': 'move',
                'message': 'Move processed successfully' if success else 'Invalid move!',
                'fen': board.fen()
            }

            print("received", from_sq + to_sq, "over websocket, success:", success)
            return response_data

        except json.JSONDecodeError:
            return {'type': 'error', 'message': 'invalid json'}

    async def handle_move(self, data):
        response_data = await self.parse_move(data)
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
