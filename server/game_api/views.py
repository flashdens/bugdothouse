import json
import re
import secrets
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
from bugdothouse_server import settings
from bugdothouse_server.settings import SECRET_KEY
from game.models import Game
from game_api.serializers import SpectatorSerializer


class ResetGameView(APIView):
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

    def get(self, request, game_code):

        game = get_object_or_404(Game, code=game_code)

        # example crazyhouse fen: 'rnbqkbnr/pppp2pp/8/5p2/8/P7/1PPP1PPP/RNBQKBNR[Pp] w KQkq - 0 4'
        pockets = re.sub(r'^.*?\[(.*?)].*$', r'\1', game.fen)  # cut out everyting but pockets
        no_pocket_fen = re.sub(r'\[.*?]', '', game.fen).replace('[]', '')  # cut out the pockets
        print(pockets)
        print(no_pocket_fen)

        response_data = {
            "status": game.status,
            "fen": no_pocket_fen.replace('~', ''),  # todo tilda workaround
            # count each piece in the pocket string, then return as a dict
            "code": game.code,
            "spectators": SpectatorSerializer(game.spectators, many=True).data,
            "whitePocket": dict(Counter([p for p in pockets if p.isupper()])),
            "blackPocket": dict(Counter([p for p in pockets if p.islower()])),
            "sideToMove": game.side_to_move,
            "gameOver": 'Checkmate' if chess.variant.CrazyhouseBoard(fen=game.fen).is_checkmate() else None,
            # todo more elegant way
            "whitePlayer": game.white_player.id if game.white_player else None,
            "blackPlayer": game.black_player.id if game.black_player else None
        }

        return Response(response_data)


class JoinGameView(APIView):
    # permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def generate_guest_username(self):
        while True:  # roll till nonexistent
            random_sequence = random.randint(100000, 999999)
            if not User.objects.filter(username=random_sequence).exists():
                return str(random_sequence)

    def post(self, request, game_code):
        if not game_code:
            return Response({'error': 'Game ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        auth_tokens = request.data.get('authTokens')
        game = get_object_or_404(Game, code=game_code)

        if auth_tokens:
            guest_token = None
            try:
                token = jwt.decode(auth_tokens['access'], SECRET_KEY, algorithms=['HS256'])
                user = get_object_or_404(User, pk=token.get('user_id'))

            except jwt.ExpiredSignatureError:
                return Response({'error': 'Token has expired'}, status=status.HTTP_403_FORBIDDEN)
            except jwt.InvalidTokenError:
                return Response({'error': 'Invalid token'}, status=status.HTTP_403_FORBIDDEN)

        else:  # create a guest account
            guest_username = 'guest-' + self.generate_guest_username()
            user = User(username=guest_username, email=guest_username + '@bug.house')
            user.save()

            # Create a token for the guest user
            access = AccessToken.for_user(user)
            refresh = RefreshToken.for_user(user)
            guest_token = {
                'refresh': str(refresh),
                'access': str(access),
            }

        # if not game.white_player or (game.black_player != user and game.white_player == user):
        #     game.white_player = user
        # elif not game.black_player or (game.white_player != user and game.black_player == user):
        #     game.black_player = user
        # else:
        #     return Response({'error': 'Game already full'}, status=status.HTTP_400_BAD_REQUEST)

        game.spectators.add(user)
        game.save()

        response_data = {
            'message': 'Successfully joined the game',
            'gameId': game.id,
        }

        if guest_token:
            response_data['guestToken'] = guest_token

        return Response(response_data, status=status.HTTP_200_OK)


class NewGameView(APIView):

    def generate_game_code(self):
        while True:  # roll till nonexistent
            code = secrets.token_bytes(3).hex()  # generate a random 6-digit hex code
            if not Game.objects.filter(code=code).exists():
                return code

    def post(self, request):
        gamemode = request.data.get('gamemode')
        room_type = request.data.get('roomType')

        # Get the JWT token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response("Authorization header missing", status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Extract the token from "Bearer <token>"
            token = auth_header.split()[1]
            # Decode the token to get the user ID
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token['user_id']
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError, KeyError):
            return Response("Invalid or expired token", status=status.HTTP_401_UNAUTHORIZED)

        user = get_object_or_404(User, pk=user_id)

        game = Game(host=user,
                    gamemode=gamemode,
                    is_private=True if room_type == 'private' else False,
                    code=self.generate_game_code())

        game.save()
        return Response({'code': game.code}, status=status.HTTP_200_OK)
