import re
from collections import Counter

from rest_framework.views import APIView
from rest_framework.response import Response
import chess
import chess.variant

from game.models import Game


class NewGameView(APIView):
    def post(self, request):
        game = Game(pk=1)
        board = chess.variant.CrazyhouseBoard()
        game.side_to_move = True
        game.fen = board.fen()
        game.save()
        response_data = {
            "fen": re.sub(r'\[.*?]', '', game.fen).replace('[]', ''),  # cut out the pockets
            "whitePocket": [],
            "blackPocket": [],
            "sideToMove": game.side_to_move,
        }

        return Response(response_data)


class GameInfoView(APIView):

    def get(self, request):
        game = Game.objects.get(pk=1)

        # example crazyhouse fen: 'rnbqkbnr/pppp2pp/8/5p2/8/P7/1PPP1PPP/RNBQKBNR[Pp] w KQkq - 0 4'
        pockets = re.sub(r'^.*?\[(.*?)].*$', r'\1', game.fen)  # cut out everyting but pockets
        no_pocket_fen = re.sub(r'\[.*?]', '', game.fen).replace('[]', '')  # cut out the pockets
        print(pockets)
        print(no_pocket_fen)

        response_data = {
            "fen": no_pocket_fen.replace('~', ''),  # todo tilda workaround
            # count each piece in the pocket string, then return as a dict
            "whitePocket": dict(Counter([p for p in pockets if p.isupper()])),
            "blackPocket": dict(Counter([p for p in pockets if p.islower()])),
            "sideToMove": game.side_to_move,
            "gameOver": 'Checkmate' if chess.variant.CrazyhouseBoard(fen=game.fen).is_checkmate() else None,
            # todo more elegant way
            "whitePlayerName": game.white_player.username if game.white_player else None,
            "blackPlayerName": game.black_player.username if game.black_player else None
        }

        return Response(response_data)


class LobbyList(APIView):
    pass
