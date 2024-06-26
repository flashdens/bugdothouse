import re
import secrets
from collections import Counter
import random
from time import sleep

import jwt
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
from game.models import Game, GameMode, GameStatus
from game_api.serializers import UserSerializer, GameSerializer


class NewGameView(APIView):
    """
    Widok API odpowiedzialny za tworzenie nowej gry.
    """

    def generate_game_code(self):
        """
        Generuje i zwracająca unikalny kod gry.
        """
        while True:  # roll till nonexistent
            code = secrets.token_bytes(3).hex()  # generate a random 6-digit hex code
            if not Game.objects.filter(code=code).exists():
                return code

    def post(self, request):
        """
        Obsługuje zapytania POST przychodzące do widoku - tworzy nową grę.
        """
        gamemode = request.data.get('gamemode')
        is_private = request.data.get('isPrivate')

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
        game_code = self.generate_game_code()

        game1 = Game(host=user,
                     gamemode=gamemode,
                     is_private=True if is_private == 'private' else False,
                     code=game_code)

        game1.save()

        if gamemode == GameMode.BUGHOUSE.value:
            game2 = Game(host=user,
                         gamemode=gamemode,
                         is_private=True if is_private == 'private' else False,
                         code=game_code,
                         brother_game=game1,
                         subgame_id=2)

            game2.save()
            game1.brother_game = game2
            game1.subgame_id = 1
            game1.save()

        return Response({'code': game_code}, status=status.HTTP_200_OK)


class GameInfoView(APIView):
    """
    Widok API odpowiedzialny za pozyskiwanie informacji o grze.
    """

    def get(self, request, game_code):
        """
        Obsługuje zapytania GET przychodzące do widoku.
        Zwraca informacje o grze określonej w parametrze game_code.
        """
        games = list(Game.objects.filter(code=game_code))
        game_boards = {}
        result_found = None

        # example crazyhouse fen: 'rnbqkbnr/pppp2pp/8/5p2/8/P7/1PPP1PPP/RNBQKBNR[Pp] w KQkq - 0 4'
        for game in games:
            if game.fen:
                pockets = re.sub(r'^.*?\[(.*?)].*$', r'\1', game.fen)  # cut out everyting but pockets
                no_pocket_fen = re.sub(r'\[.*?]', '', game.fen).replace('[]', '')  # cut out the pockets
            else:  # initializing to avoid null reference errors
                pockets = ""
                no_pocket_fen = ""

            if game.result and not result_found:
                result_found = game.result

            game_boards[str(game.subgame_id)] = {
                "fen": no_pocket_fen.replace('~', ''),  # todo tilda workaround
                # count each piece in the pocket string, then return as a dict
                "whitePocket": dict(Counter([p for p in pockets if p.isupper()])),
                "blackPocket": dict(Counter([p for p in pockets if p.islower()])),
                "sideToMove": game.side_to_move,
                "gameOver": game.result,
                # todo more elegant way
                "whitePlayer": UserSerializer(game.white_player).data if game.white_player else None,
                "blackPlayer": UserSerializer(game.black_player).data if game.black_player else None,
                "lastMoveFromSquare": game.last_move_from_square,
                "lastMoveToSquare": game.last_move_to_square,
            }

        game = games[0]

        return Response(
            {
                "status": game.status,
                "gameMode": game.gamemode,
                "gameCode": game.code,
                "spectators": UserSerializer(game.spectators, many=True).data,
                "host": UserSerializer(game.host).data,
                "result": result_found,
                "boards": game_boards,
            }
        )


class JoinGameView(APIView):
    """
    Widok API odpowiedzialny za obsługę dołączania się graczy do gry.
    """

    def generate_guest_username(self):
        """
        Generuje i zwraca nazwę użytkownika dla gościa serwisu.
        """
        while True:  # roll till nonexistent
            random_sequence = random.randint(100000, 999999)
            if not User.objects.filter(username=random_sequence).exists():
                return 'guest-' + str(random_sequence)

    def post(self, request, game_code):
        """
        Obsługuje zapytania POST przychodzące do widoku.
        Dołącza użytkowników do gier,
        """

        if not game_code:
            return Response({'error': 'Game ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        auth_token = request.headers.get('Authorization', None)
        if auth_token:
            auth_token = auth_token.split(' ')[1]

        # spectators are shared between games, so joining to first one joins to second as well
        game = Game.objects.filter(code=game_code).first()

        if auth_token:
            guest_token = None
            try:
                decoded_token = jwt.decode(auth_token, SECRET_KEY, algorithms=['HS256'])
                user = get_object_or_404(User, pk=decoded_token.get('user_id'))

            except jwt.ExpiredSignatureError:
                return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
            except jwt.InvalidTokenError:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        else:  # create a guest account
            guest_username = self.generate_guest_username()
            user = User(username=guest_username, email=guest_username + '@bug.house')
            user.save()

            # Create a token for the guest user
            access = AccessToken.for_user(user)
            guest_token = {
                'access': str(access),
            }

        # if not game.white_player or (game.black_player != user and game.white_player == user):
        #     game.white_player = user
        # elif not game.black_player or (game.white_player != user and game.black_player == user):
        #     game.black_player = user
        # else:
        #     return Response({'error': 'Game already full'}, status=status.HTTP_400_BAD_REQUEST)
        if (user not in game.spectators.all()
                and user != game.white_player
                and user != game.black_player):
            game.spectators.add(user)

        game.save()

        response_data = {
            'message': 'Successfully joined the game',
            'gameId': game.id,
        }

        if guest_token:
            response_data['guestToken'] = guest_token

        return Response(response_data, status=status.HTTP_200_OK)


class StartGameView(APIView):
    """
    Widok API odpowiedzialny za startowanei rozgrywek.
    """

    def can_start_game(self, game, user):
        """
        Ustala, czy gra może zostać rozpoczęta.
        """
        if game.host != user:
            return Response({"error": "Only game hosts can start games"},
                            status=status.HTTP_400_BAD_REQUEST)

        if game.status != GameStatus.WAITING_FOR_START.value:
            return Response({"error": "Game was already started"},
                            status=status.HTTP_400_BAD_REQUEST)

        if game.white_player is None or game.black_player is None:
            return Response({"error": "Sides have not been taken"},
                            status=status.HTTP_400_BAD_REQUEST)

        return True

    def post(self, request, game_code):
        """
        Obsługuje zapytania POST przychodzące do widoku.
        Rozpoczyna gry.
        """
        token = request.headers.get('Authorization').split(" ")[1]
        try:
            token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_403_FORBIDDEN)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_403_FORBIDDEN)

        games = Game.objects.filter(code=game_code)
        user = get_object_or_404(User, pk=token.get('user_id'))

        for game in games:
            if self.can_start_game(game, user):
                game.fen = \
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR[] w KQkq - 0 1" \
                        if game.gamemode != GameMode.CLASSICAL.value else "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                game.status = GameStatus.ONGOING
                game.save()

        return Response({
            "success": True,
            "info": f"Game {game_code} started"
        })


class PublicGameListView(APIView):
    """
    Widok API listy gier.
    """

    def get(self, request):
        """
        Obsługuje zapytania GET przychodzące do widoku.
        Zwraca listę nierozpoczętych, publicznych gier.
        """
        games = Game.objects.filter(
            status=GameStatus.WAITING_FOR_START.value,
            is_private=False,
            subgame_id=1  # don't fetch subgames
        )

        serializer = GameSerializer(games, many=True)

        return Response(serializer.data)
