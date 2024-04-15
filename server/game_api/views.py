import random

from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ChessPositionSerializer, ChessMoveSerializer
import chess

board = chess.Board()


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
        global board
        board.reset_board()
        response_data = {
            "fen": board.fen()
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
            # Remember to validate the move and update the game state accordingly

            move = chess.Move.from_uci(from_sq + to_sq)
            board.push(move)
            print(board)

            response_data = {
                'message': 'Move received successfully.',
                'from_sq': from_sq,
                'to_sq': to_sq,
                'side_to_move': side_to_move,
                'fen': board.fen()
            }

            print("received", from_sq + to_sq)
            return Response(response_data)
        else:
            return Response(serializer.errors, status=400)
