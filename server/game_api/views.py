import random

import server.bugdothouse_server.settings
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ChessPositionSerializer
import chess


class RandomPositionView(APIView):
    def get(request, format=None):
        board = chess.Board()
        for _ in range(random.randint(10, 30)):
            legal_moves = list(board.legal_moves)
            random_move = random.choice(legal_moves)
            board.push(random_move)

        serializer = ChessPositionSerializer({'fen': board.fen()})
        return Response(serializer.data)
