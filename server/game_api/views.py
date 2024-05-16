import re
from collections import Counter
import random

import jwt
from jwt import InvalidTokenError, ExpiredSignatureError
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
import chess
import chess.variant
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

from authorization.models import User
from bugdothouse_server.settings import SECRET_KEY
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


class JoinGameView(APIView):
    # permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def generate_guest_username(self):
        while True:  # roll till nonexistent
            random_sequence = f"guest-{random.randint(100000, 999999)}"
            if not User.objects.filter(username=random_sequence).exists():
                return random_sequence

    def post(self, request, game_id):
        access_token = request.data.get('accessToken')

        if not game_id:
            return Response({'error': 'Game ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        game = get_object_or_404(Game, id=game_id)

        if request.access_token:
            try:
                jwt.decode(access_token, SECRET_KEY, algorithms=['HS256'])
            except Exception as e:
                return Response({'error': e}, status=status.HTTP_403_FORBIDDEN)

            user = request.user
            guest_token = None
        else:  # create a guest account
            guest_username = 'guest-' + self.generate_guest_username()
            user = User(username=guest_username)
            user.save()

            # Create a token for the guest user
            access = AccessToken.for_user(user)
            refresh = RefreshToken.for_user(user)
            guest_token = {
                'refresh': str(refresh),
                'access': str(access),
            }

        if game.white_player and game.white_player.pk == user.pk or game.black_player and game.black_player.pk == user.pk:
            return Response({'error': 'You already joined the game'}, status=status.HTTP_400_BAD_REQUEST)

        if not game.white_player:
            game.white_player = user
        elif not game.black_player:
            game.black_player = user
        else:
            return Response({'error': 'Game already full'}, status=status.HTTP_400_BAD_REQUEST)

        game.save()

        response_data = {
            'message': 'Successfully joined the game',
            'gameId': game.id,
        }

        if guest_token:
            response_data['guestToken'] = guest_token

        return Response(response_data, status=status.HTTP_200_OK)
