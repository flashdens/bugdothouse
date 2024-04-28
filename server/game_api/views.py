import random

from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ChessPositionSerializer, ChessMoveSerializer
import chess

from game.models import Game

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
        game = Game(pk=1)
        board = chess.Board()
        game.fen = board.fen()
        game.save()
        response_data = {
            "fen": board.fen()
        }

        return Response(response_data)


class GameInfoView(APIView):

    def get(self, request):
        game = Game.objects.get(pk=1)
        response_data = {
            "fen": game.fen,
            "side_to_move": game.side_to_move,
            "white_player_name": game.white_player.username if game.white_player else None,
            "black_player_name": game.black_player.username if game.black_player else None
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
