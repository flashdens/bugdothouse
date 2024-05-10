import random
import re

from rest_framework.views import APIView
from rest_framework.response import Response
import chess
import chess.variant

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

        # example crazyhouse fen: 'rnbqkbnr/pppp2pp/8/5p2/8/P7/1PPP1PPP/RNBQKBNR[Pp] w KQkq - 0 4'
        pockets = re.sub(r'^.*?\[(.*?)].*$', r'\1', game.fen) # cut out everyting but pockets
        no_pocket_fen = re.sub(r'\[.*?]', '', game.fen).replace('[]', '') # cut out the pockets

        response_data = {
            "fen": no_pocket_fen,
            "whitePocket": [p for p in pockets if p.upper()],
            "blackPocket": [p for p in pockets if p.lower()],
            "sideToMove": game.side_to_move,
            "gameOver": 'Checkmate' if chess.Board(fen=game.fen).is_checkmate() else None,  # todo more elegant way
            "whitePlayerName": game.white_player.username if game.white_player else None,
            "blackPlayerName": game.black_player.username if game.black_player else None
        }

        return Response(response_data)

class LobbyList(APIView):
    pass