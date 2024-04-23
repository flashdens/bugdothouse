import random

from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ChessPositionSerializer, ChessMoveSerializer
import chess

from game_ws.consumers import board

class RandomPositionView(APIView):
    def get(request, format=None):
        board = chess.Board()
        for _ in range(random.randint(10, 30)):
            legal_moves = list(board.legal_moves)
            random_move = random.choice(legal_moves)
            board.push(random_move)

        serializer = ChessPositionSerializer({'fen': board.fen()})
        return Response(serializer.data)


class NewGameView(APIView):
    def post(self, request):
        board.reset_board()
        response_data = {
            "fen": board.fen()
        }

        return Response(response_data)


class GameInfoView(APIView):
    # not working, board has 2 seperate memory addresses
    def get(self, request):
        global board
        print(hex(id(board)))
        response_data = {
            "fen": board.fen(),
            "side_to_move": board.turn,
            "player1_name": "player1",
            "player2_name": "player2"
        }

        return Response(response_data)


class MakeMoveView(APIView):
    global board

    def post(self, request):
        # Deserialize the move data
        serializer = ChessMoveSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            from_sq = serializer.validated_data['fromSq']
            to_sq = serializer.validated_data['toSq']
            side_to_move = serializer.validated_data['sideToMove']

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
            print("received", from_sq + to_sq)

            return Response(response_data, status=200 if success else 422)

        else:
            return Response(serializer.errors, status=400)
