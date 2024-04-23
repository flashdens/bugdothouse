import json

from channels.generic.websocket import WebsocketConsumer
from .serializers import ChessMoveSerializer

import chess

board = chess.Board()


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, code):
        pass

    def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
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
                'from_sq': from_sq,
                'to_sq': to_sq,
                'side_to_move': side_to_move,
                'fen': board.fen()
            }

            print("received", from_sq + to_sq, "over websocket")

            self.send(text_data=json.dumps(response_data))

        except json.JSONDecodeError:
            self.send(text_data=json.dumps({'message': 'invalid json'}))