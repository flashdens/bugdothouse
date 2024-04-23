import json
import uuid

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

import chess
from django.shortcuts import redirect

board = chess.Board()


class GameConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.players = []
        super().__init__(*args, **kwargs)

    def connect(self):
        # self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "game"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()
        # self.players.append(str(uuid.uuid4()))

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data=None, bytes_data=None):
        global board
        try:
            data = json.loads(text_data)
            print(hex(id(board)))
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            side_to_move = data.get('sideToMove')

            # Your logic to handle the move...
            # Remember to validate the move and update the test state accordingly

            success = False
            move = chess.Move.from_uci(from_sq + to_sq)

            if move in board.legal_moves:
                success = True
                board.push(move)

            print(board)

            response_data = {
                'message': 'Move processed successfully' if success else 'Invalid move!',
                'fen': board.fen()
            }

            print("received", from_sq + to_sq, "over websocket")
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "move", "move": response_data}
            )

        except json.JSONDecodeError:
            self.send(text_data=json.dumps({'message': 'invalid json'}))

    def move(self, event):
        move = event['move']
        self.send(text_data=json.dumps({'move': move}))
