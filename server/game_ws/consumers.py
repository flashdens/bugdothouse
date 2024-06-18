import asyncio
import json
import random
import re
from enum import Enum
from collections import Counter

import jwt
from asgiref.sync import sync_to_async
from asyncio import sleep
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

import chess
import chess.variant

from django.shortcuts import get_object_or_404

from bugdothouse_server import settings
from .engine_connection import EngineConnection
from game.models import Game, Move, GameStatus, GameMode, GameResult
from authorization.models import User


class SideToMove(Enum):
    WHITE = True
    BLACK = False


class GameConsumer(AsyncWebsocketConsumer):
    """
    Klasa osługująca zdarzenia WebSocket.
    """

    def __init__(self, *args, **kwargs):
        """
        Konstruktor.
        """
        super().__init__(*args, **kwargs)

    async def connect(self):
        """
        Asynchroniczna metoda wywoływana przy podłączeniu się użytkownika do gniazdka.
        """
        self.room_name = self.scope["url_route"]["kwargs"]["game_code"]
        self.room_group_name = f"lobby_{self.room_name}"
        print('connected')
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        """
        Asynchroniczna metoda wywoływana przy rozłączeniu się użytkownika od gniazdka.
        """

        print('disconnected')
        self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )
        self.channel_layer.group_send(
            self.room_group_name, {'type': 'lobby.connect'})

    def determine_game_outcome(self, board):
        """
        Pomocnicza metoda rozpatrująca i zwracająca wynik gry.
        """
        if board.turn == chess.BLACK:  # black was mated
            return GameResult.WHITE_WIN
        elif board.turn == chess.WHITE:  # white was mated
            return GameResult.BLACK_WIN
        elif self.is_game_draw(board):
            return GameResult.DRAW
        else:
            assert False

    def is_game_draw(self, board):
        """
        Metoda zwracająca wartość logiczną opisującą, czy gra zakończyła się remisem.
        """
        return (board.is_stalemate()
                or board.is_insufficient_material()
                or board.is_seventyfive_moves()
                or board.is_fivefold_repetition())

    async def parse_jwt_token_async(self, token):
        """
        Asynchroniczna metoda dekodująca i weryfikująca żeton JWT użytkownika.
        Zwraca odkodowany token, w przypadku problemów zwraca błąd.
        """
        try:
            decoded_token = await sync_to_async(jwt.decode)(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return False, {'type': 'error', 'error': 'Token has expired'}
        except jwt.InvalidTokenError:
            return False, {'type': 'error', 'error': 'Invalid token'}

        return decoded_token

    async def get_game_async(self, room_name, subgame):
        """
        Asnychroniczna metoda pomocnicza, pobierająca i zwracająca model gry o odpowiednich parametrach z bazy danych.
        """
        return await database_sync_to_async(get_object_or_404)(Game, code=room_name, subgame_id=subgame)

    async def get_user_async(self, user_id):
        """
        Asnychroniczna metoda pomocnicza, pobierająca i zwracająca model użytkownika o odpowiednich parametrach z
        bazy danych.
        """
        return await database_sync_to_async(get_object_or_404)(User, id=user_id)

    def is_ai_turn_in_game(self, game):
        """
        Metoda pomocnicza ustalająca i zwracająca wartość logiczną, czy następny ruch w grze należy do
        gracza komputerowego.
        """
        return (game.status == GameStatus.ONGOING
                and ((game.side_to_move == SideToMove.WHITE.value
                      and game.white_player.username == 'bugdothouse_ai')
                     or
                     (game.side_to_move == SideToMove.BLACK.value
                      and game.black_player.username == 'bugdothouse_ai')))

    def is_promotion_move(self, board, from_sq, to_sq, dropped_piece):
        """
        Metoda pomocnicza ustalająca i zwracająca wartość logiczną, czy ruch w grze jest promocją piona.
        """
        # under no circumstances should drops be promotions
        if dropped_piece:
            return False
        from_sq = chess.parse_square(from_sq)
        to_sq = chess.parse_square(to_sq)
        piece = board.piece_at(from_sq)

        if piece.piece_type != chess.PAWN:
            return False

        if (piece.color == chess.WHITE and chess.square_rank(to_sq) == 7) or \
                (piece.color == chess.BLACK and chess.square_rank(to_sq) == 0):
            return True

    async def make_move_on_board(self, board, game, from_sq=None, to_sq=None, dropped_piece=None, promotion=None,
                                 is_ai_move=False):
        """
        Metoda konstruująca ruch UCI z podanych parametrów lub pozyskująca go od silnika szachowego.
        Jeśli ruch jest poprawny, jest wykonywany na planszy.
        Zwraca łańcuch UCI.
        """
        if is_ai_move:
            engine_conn = EngineConnection()
            await engine_conn.connect("setoption name UCI_Variant value crazyhouse")
            move = await engine_conn.get_engine_move(board, depth=3)

            if move not in board.legal_moves:
                assert False  # ?

        else:
            if from_sq:  # move from board
                move = chess.Move.from_uci(from_sq + to_sq + (promotion if self.is_promotion_move(board,
                                                                                                  from_sq,
                                                                                                  to_sq,
                                                                                                  dropped_piece=None) else ''))
                is_move_valid = move in board.legal_moves
            else:  # move from pocket
                move = chess.Move.from_uci(
                    (dropped_piece.upper() if board.turn else dropped_piece.lower()) + '@' + to_sq)
                is_move_valid = chess.parse_square(to_sq) in board.legal_drop_squares() and move in board.legal_moves

            if not is_move_valid:
                return None

        # it's a bughouse capture, we need to make some shenanigans
        if board.is_capture(move) and game.gamemode == GameMode.BUGHOUSE.value:
            brother_game = await self.get_game_async(room_name=self.room_name,
                                                     subgame=2 if game.subgame_id == 1 else 1)

            # add captured piece to brother game
            captured_piece = board.piece_at(move.to_square)
            prev_pocket_match = re.search(r'\[(.*?)]', brother_game.fen)
            brother_game.fen = re.sub(r'\[(.*?)]',
                                      '[' + prev_pocket_match.group(1) + captured_piece.symbol() + ']',
                                      brother_game.fen)

            await brother_game.asave()

            # make move on game board
            board.push(move)

            # remove the captured piece from current board's pocket
            piece_to_pop = chess.Piece.from_symbol(
                captured_piece.symbol().upper()
                if captured_piece.symbol().islower()
                else captured_piece.symbol().lower()
            )

            prev_side = not board.turn
            board.pockets[prev_side].remove(piece_to_pop.piece_type)

        else:  # if it's not bughouse, just make the move :)
            board.push(move)

        return move

    async def send_move_to_clients(self, game):
        """
        Metoda wysyłająca informację o ruchu oraz stanie gry do klientów podłączonych gniazdkiem WebSocket.
        """
        games = await sync_to_async(list)(
            Game.objects.filter(code=game.code).order_by('subgame_id')
        )  # todo VERY redundant query

        game_boards = {}
        result_found = None
        status_update = None

        for game in games:
            pockets = re.sub(r'^.*?\[(.*?)].*$', r'\1', game.fen)  # Extract pockets
            no_pocket_fen = re.sub(r'\[.*?]', '', game.fen).replace('[]', '')  # Remove pockets from FEN

            if game.result:
                result_found = game.result
            elif result_found and not game.result:
                game.result = result_found

            if game.status == 2:
                status_update = 2
            elif status_update and game.status != 2:
                game.status = status_update

            # cast to str to avoid strict_map_key=True error
            game_boards[str(game.subgame_id)] = {
                "fen": no_pocket_fen.replace('~', ''),  # Tilde workaround
                "whitePocket": dict(Counter([p for p in pockets if p.isupper()])),
                "blackPocket": dict(Counter([p for p in pockets if p.islower()])),
                "sideToMove": game.side_to_move,
                "result": game.result,
            }

            if result_found or status_update:
                await game.asave()

        # update other results
        if result_found:
            for game in games:
                if not game.result:
                    game.result = result_found
                    await game.asave()

        if status_update:
            for game in games:
                if game.status == 1:
                    game.result = 2
                    await game.asave()

        response_data = {
            "type": "move",
            "status": status_update if status_update else game.status,
            "result": result_found,
            "boards": game_boards,
        }

        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'game.move', 'message': response_data}
        )

    async def send_error_to_client(self, error_data):
        """
        Metoda wysyłająca informację o błędzie w przetwarzaniu zapytania do klienta, który je wysłał.
        """
        await self.send(text_data=json.dumps(error_data))

    async def process_move(self, game, board, move_maker=None, move_data=None, is_ai_move=False):
        """
        Metoda przetwarzająca ruch.
        Po wykonaniu go na planszy zapisuje ruch i aktualizuje planszę w bazie danych.
        """
        if not board.is_checkmate() or self.is_game_draw(board):
            if not is_ai_move:
                move = await self.make_move_on_board(board,
                                                     game,
                                                     move_data['from_sq'],
                                                     move_data['to_sq'],
                                                     move_data['dropped_piece'],
                                                     move_data['promotion'])
            else:
                move = await self.make_move_on_board(board,
                                                     game,
                                                     is_ai_move=True)
            if move is None:
                await self.send_error_to_client({'error': 'Invalid move!'})
                return

            game.side_to_move = board.turn
            game.fen = board.fen()
            move_instance = Move(game=game,
                                 player=move_maker,
                                 move=move)
            await move_instance.asave()

            if board.is_checkmate() or self.is_game_draw(board):
                game.result = self.determine_game_outcome(board).value
                game.status = GameStatus.FINISHED.value

        else:
            game.result = self.determine_game_outcome(board).value
            game.status = GameStatus.FINISHED.value

        await game.asave()

    async def handle_player_move(self, data):
        """
        Punkt wejścia dla wysłanego zdarzenia "move". Obsługuje ruch użytkownika.
        """
        try:
            token = data.get('token')
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            dropped_piece = data.get('droppedPiece')
            code = data.get('code')
            promotion = data.get('promotion')
            subgame = data.get('subgame')
        except json.JSONDecodeError:
            return False, {'type': 'error', 'error': 'Invalid JSON'}

        decoded_token = await self.parse_jwt_token_async(token)
        user_id = decoded_token['user_id']

        user = await self.get_user_async(user_id)

        game = await Game.objects.select_related('white_player', 'black_player').aget(code=code, subgame_id=subgame)

        if game.status != GameStatus.ONGOING.value:
            return False, {'type': 'error', 'error': "Game is not going on"}

        if game.gamemode == GameMode.CLASSICAL.value:
            if from_sq is None:
                return False, {"type": "error", "error": "Piece drops are not allowed in classical games!"}
            board = chess.Board(fen=game.fen)
        else:
            board = chess.variant.CrazyhouseBoard(fen=game.fen)

        board.turn = game.side_to_move
        player = game.white_player if board.turn == chess.WHITE else game.black_player

        if user != player:
            return False, {'type': 'error', 'error': "You're not the player to move"}

        move_data = {
            'from_sq': from_sq,
            'to_sq': to_sq,
            'dropped_piece': dropped_piece,
            'promotion': promotion
        }

        await self.process_move(game, board, player, move_data)
        await self.send_move_to_clients(game)

        while self.is_ai_turn_in_game(game):
            ai_player = await User.objects.aget(username='bugdothouse_ai')
            await self.process_move(game,
                                    board,
                                    ai_player,
                                    is_ai_move=True)
            await self.send_move_to_clients(game)

    class PlayerRoles(Enum):
        WHITE_PLAYER = 0
        BLACK_PLAYER = 1
        SPECTATOR = 2

    @sync_to_async
    def check_user_in_game_sync(self, game, user):
        """
        Pomocnicza metoda, sprawdzająca, czy użytkownik znajduje się w grze.
        """
        return user in game.spectators.all() or game.white_player == user or game.black_player == user

    async def check_user_in_game(self, game, user):
        """
        Pomocnicza metoda, która owija funkcję asynchroniczną sprawdzającą, czy użytkownik znajduje się w grze.
        """
        return await self.check_user_in_game_sync(game, user)

    @sync_to_async
    def remove_user_from_game_sync(self, user, game, from_side):
        """
        Metoda usuwającego gracza z danej gry, jeśli się tam znajduje.
        """
        if (game.white_player is not None
                and game.white_player.pk == user.pk
                and from_side == self.PlayerRoles.WHITE_PLAYER.value):
            game.white_player = None

        elif (game.black_player is not None
              and game.black_player.pk == user.pk
              and from_side == self.PlayerRoles.BLACK_PLAYER.value):
            game.black_player = None

        elif user in game.spectators.all() and from_side == self.PlayerRoles.SPECTATOR.value:
            game.spectators.remove(user)

        game.save()

    async def remove_user_from_game(self, user, game, from_side):
        """
        Pomocnicza metoda, która owija funkcję asynchroniczną usuwającą użytkownika z gry.
        """
        await self.remove_user_from_game_sync(user, game, from_side)

    async def add_user_to_game(self, user, game, to_side):
        """
        Metoda dodająca użytkownika do gry.
        """
        if await sync_to_async(lambda: game.white_player is None)() and to_side == self.PlayerRoles.WHITE_PLAYER.value:
            await sync_to_async(setattr)(game, 'white_player', user)
        elif await sync_to_async(
                lambda: game.black_player is None)() and to_side == self.PlayerRoles.BLACK_PLAYER.value:
            await sync_to_async(setattr)(game, 'black_player', user)
        elif to_side == self.PlayerRoles.SPECTATOR.value:
            await sync_to_async(game.spectators.add)(user)

        await game.asave()

    async def switch_user_positions(self, user, src_game, dest_game, from_side, to_side):
        """
        Metoda zamieniająca strony użytkownika w grze (np. obserwujący->biały, biały->czarny etc.)
        """
        if src_game.pk == dest_game.pk:
            dest_game = src_game
        await self.remove_user_from_game(user, src_game, from_side)
        await self.add_user_to_game(user, dest_game, to_side)

        await dest_game.asave()  # saving this first dodges a lot of lobby bugs apparently
        await src_game.asave()

    async def handle_user_switch(self, data):
        """
        Punkt wejścia dla wysłanego zdarzenia WebSocket "lobbySwitch".
        """
        from_subgame = data['fromSubgame']
        from_side = data['fromSide']
        to_subgame = data['toSubgame']
        to_side = data['toSide']
        token = data['token']

        src_game = await (Game.objects.select_related('white_player', 'black_player').
                          aget(code=self.room_name, subgame_id=from_subgame))

        dest_game = await (Game.objects.select_related('white_player', 'black_player').
                           aget(code=self.room_name, subgame_id=to_subgame))

        if src_game.status != GameStatus.WAITING_FOR_START.value:
            return False, {'type': 'error', 'error': 'Game has already started'}

        decoded_token = await self.parse_jwt_token_async(token)
        user_id = decoded_token['user_id']

        user = await self.get_user_async(user_id)
        user_in_game = await self.check_user_in_game(src_game, user)

        if not user_in_game:
            return False, 'co ty tutaj robisz'

        await self.switch_user_positions(user, src_game, dest_game, from_side, to_side)
        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'lobby.switch', 'message': {'success': True}})

    async def handle_ai_lobby_action(self, data):
        """
        Punkt wejścia dla wysłanego zdarzenia WebSocket "lobbySwitch"
        """
        event = data['event']
        subgame = data['toSubgame']
        side = data['toSide']
        token = data['token']

        decoded_token = await self.parse_jwt_token_async(token)
        user_id = decoded_token['user_id']

        user = await self.get_user_async(user_id)
        game = await self.get_game_async(self.room_name, subgame)
        host = await database_sync_to_async(getattr)(game, 'host')

        if user.pk != host.pk:
            return False, {'type': 'error', 'error': 'Only hosts can manage AI players!'}

        ai_player = await database_sync_to_async(get_object_or_404)(User, username='bugdothouse_ai')
        if event == 'aiAdd':
            await self.add_user_to_game(ai_player, game, side)
        elif event == 'aiRemove':
            await self.remove_user_from_game(ai_player, game, side)
        await game.asave()

        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'lobby.connect'})

        return True

    async def handle_ai_turn(self, game, board):
        """
        Metoda obsługująca ruch gracza komputerowego w grze.
        """
        while self.is_ai_turn_in_game(game):
            ai_player = await User.objects.aget(username='bugdothouse_ai')
            await self.process_move(game,
                                    board,
                                    ai_player,
                                    is_ai_move=True)

    async def find_non_host_player_in_game(self, game):
        """
        Pomocnicza metoda znajdującego gracza w ramach gry, który nie jest hostem.
        """
        if game.white_player and game.white_player.pk != game.host.pk:
            return game.white_player
        elif game.black_player and game.black_player.pk != game.host.pk:
            return game.black_player
        else:
            async for spectator in game.spectators.all():
                if spectator.pk != game.host.pk:
                    return spectator

        return None

    async def assign_new_game_host(self, game):
        """
        Funkcja znajdującego nowego hosta dla gry lub usuwająca ją w przypadku braku możliwości znalezienia go.
        """
        found_player = await self.find_non_host_player_in_game(game)
        brother_game = await Game.objects.select_related('white_player', 'black_player', 'host').aget(
            code=self.room_name,
            subgame_id=2 if game.subgame_id == 1
            else 2)

        if found_player:
            game.host = found_player
            if brother_game:
                brother_game.host = found_player
                await brother_game.asave()
            await game.asave()
            return True

        if game.gamemode == GameMode.BUGHOUSE:

            found_player = await self.find_non_host_player_in_game(brother_game)
            if found_player:
                game.host = found_player
                brother_game.host = found_player
                await brother_game.asave()
                await game.asave()
                return True

        return False

    async def handle_user_disconnect(self, data):
        """
        Punkt wejścia dla wysłanego zdarzenia WebSocket "disconnect".
        """
        subgame_id = data.get('subgameId')
        player_role = data.get('playerRole')
        token = data.get('token')

        decoded_token = await self.parse_jwt_token_async(token)
        user_id = decoded_token['user_id']

        user = await self.get_user_async(user_id)

        game = await Game.objects.select_related('white_player', 'black_player', 'host').aget(code=self.room_name,
                                                                                              subgame_id=subgame_id)

        await self.remove_user_from_game(user, game, player_role)

        if game.host.pk == user.pk:  # if a host left the game...
            new_host_found = await self.assign_new_game_host(game)  # ...we need to find a new one

        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'lobby.connect'})

    async def handle_game_start(self):
        """
        Punkt wejścia dla wysłanego zdarzenia WebSocket "gameStart".
        """
        started_games = await sync_to_async(list)(Game.objects
                                                  .select_related('white_player', 'black_player')
                                                  .filter(code=self.room_name))

        for game in started_games:
            await self.channel_layer.group_send(
                self.room_group_name, {'type': 'game.start'})

            if self.is_ai_turn_in_game(game):
                if game.gamemode == GameMode.CLASSICAL.value:
                    board = chess.Board(fen=game.fen)
                else:
                    board = chess.variant.CrazyhouseBoard(fen=game.fen)

                print(self.is_ai_turn_in_game(game))
                while self.is_ai_turn_in_game(game):
                    await self.handle_ai_turn(game, board)
                    await self.send_move_to_clients(game)

    async def receive(self, text_data=None, bytes_data=None):
        """
        Punkt wejścia dla każdego zdarzenia WebSocket wysłanego do gniazdka.
        Wywołuje on odpowiednią metodę do obsługi zdarzenia.
        """
        print(text_data)
        try:
            data = json.loads(text_data)
            event_type = data['type']
            if event_type == 'move':
                await self.handle_player_move(data)
            elif event_type == 'lobbySwitch':
                await self.handle_user_switch(data)
            elif event_type == 'lobbyAI':
                await self.handle_ai_lobby_action(data)
            elif event_type == 'connect':
                await self.channel_layer.group_send(
                    self.room_group_name, {'type': 'lobby.connect'})
            elif event_type == 'disconnect':
                await self.handle_user_disconnect(data)
            elif event_type == 'gameStart':
                await self.handle_game_start()
                await self.channel_layer.group_send(
                    self.room_group_name, {'type': 'game.start'})
            else:
                await self.send(text_data=json.dumps({'message': 'invalid request received'}))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'message': 'invalid json'}))

    """
    Metody wysyłające zdarzenia WebSocket do wszystkich klientów podłączonych do gniazdka.
    """
    
    async def game_move(self, event):
        move = event['message']
        await self.send(json.dumps(move))
        await asyncio.sleep(1)

    async def game_ai_move(self, event):
        move = event['message']
        await self.send(json.dumps(move))
        await asyncio.sleep(1)

    async def lobby_switch(self, event):
        await self.send(text_data=json.dumps({"type": "lobbySwitch",
                                              "success": True}))

    async def lobby_connect(self, event):
        await self.send(text_data=json.dumps({"type": "connect"}))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({"type": "gameStart"}))
