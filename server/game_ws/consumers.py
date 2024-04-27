import json

from channels.generic.websocket import AsyncWebsocketConsumer

import chess
from django.shortcuts import redirect, get_object_or_404

from game.models import Game, Move

board = chess.Board()


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.players = []
        super().__init__(*args, **kwargs)

    async def connect(self):
        self.room_group_name = "game"
        print("connected")
        self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )

        await self.accept()

    async def disconnect(self, code):
        self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def handle_connect(self, data):
        username = data.get('username')
        print(username)

    async def handle_move(self, data):
        try:
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            side_to_move = data.get('sideToMove')

            game = get_object_or_404(Game, pk=1)

            success = False
            move = chess.Move.from_uci(from_sq + to_sq)

            if move in board.legal_moves:
                success = True
                board.push(move)

            print(board)

            game.side_to_move = not game.side_to_move
            game.fen = board.fen()
            game.save()

            db_move = Move(game=game,
                           player="TEST",
                           move=move)

            db_move.save()

            response_data = {
                'message': 'Move processed successfully' if success else 'Invalid move!',
                'fen': board.fen()
            }

            print("received", from_sq + to_sq, "over websocket")
            self.channel_layer.group_send(
                self.room_group_name, {"type": "move",
                                       "move": response_data}
            )

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'message': 'invalid json'}))

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
            event_type = json.loads('type')

            if event_type == 'connect':
                await self.handle_connect(data)
            elif event_type == 'move':
                await self.handle_move(data)
            else:
                assert False

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'message': 'invalid json'}))

    async def move(self, event):
        move = event['move']
        await self.send(text_data=json.dumps({'move': move}))
