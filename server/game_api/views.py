import random
import re

from rest_framework.views import APIView
from rest_framework.response import Response
import chess

from game.models import Game


class NewGameView(APIView):
    def post(self, request):
        game = Game(pk=1)
        board = chess.Board()
        game.side_to_move = True
        game.fen = board.fen()
        game.save()
        response_data = {
            "fen": board.fen()
        }

        return Response(response_data)


class GameInfoView(APIView):

    def get(self, request):
        game = Game.objects.get(pk=1)

        # Assuming game.fen contains the FEN string
        game.fen = re.sub(r'\[.*?]', '', game.fen)
        game.fen = game.fen.replace('[]', '')

        response_data = {
            "fen": game.fen,
            "sideToMove": game.side_to_move,
            "gameOver": 'Checkmate' if chess.Board(fen=game.fen).is_checkmate() else None,  # todo more elegant way
            "whitePlayerName": game.white_player.username if game.white_player else None,
            "blackPlayerName": game.black_player.username if game.black_player else None
        }

        return Response(response_data)
