import json
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
            random_sequence = random.randint(100000, 999999)
            if not User.objects.filter(username=random_sequence).exists():
                return random_sequence

    def post(self, request, game_id):
        if not game_id:
            return Response({'error': 'Game ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        auth_tokens = request.data.get('authTokens')
        game = get_object_or_404(Game, id=game_id)

        if auth_tokens:
            try:
               token = jwt.decode(auth_tokens['access'], SECRET_KEY, algorithms=['HS256'])

            except jwt.ExpiredSignatureError:
                return Response({'error': 'Token has expired'}, status=status.HTTP_403_FORBIDDEN)
            except jwt.InvalidTokenError:
                return Response({'error': 'Invalid token'}, status=status.HTTP_403_FORBIDDEN)

            user = get_object_or_404(User, pk=token.get('user_id'))
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
