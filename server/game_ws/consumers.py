import asyncio
import json
import random
import re
import time
import traceback
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
from game.models import Game, Move, GameStatus, GameMode, GameResult
from authorization.models import User


class SideToMove(Enum):
    WHITE = True
    BLACK = False


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.players = []
        super().__init__(*args, **kwargs)

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["game_code"]
        self.room_group_name = f"lobby_{self.room_name}"
        print('connected')
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        print('disconnected')
        self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    def determine_game_outcome(self, board):
        if board.turn == chess.BLACK:  # black was mated
            return GameResult.WHITE_WIN
        elif board.turn == chess.WHITE:  # white was mated
            return GameResult.BLACK_WIN
        elif self.is_game_draw(board):
            return GameResult.DRAW
        else:
            assert False

    def is_game_draw(self, board):
        return (board.is_stalemate()
                or board.is_insufficient_material()
                or board.is_seventyfive_moves()
                or board.is_fivefold_repetition())

    async def parse_jwt_token_async(self, token):
        try:
            decoded_token = await sync_to_async(jwt.decode)(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return False, {'type': 'error', 'error': 'Token has expired'}
        except jwt.InvalidTokenError:
            return False, {'type': 'error', 'error': 'Invalid token'}

        return decoded_token

    async def get_game_async(self, room_name, subgame):
        return await database_sync_to_async(get_object_or_404)(Game, code=room_name, subgame_id=subgame)

    async def get_user_async(self, user_id):
        return await database_sync_to_async(get_object_or_404)(User, id=user_id)

    def is_ai_turn_in_game(self, game):
        return ((game.side_to_move == SideToMove.WHITE.value
                 and game.white_player.username == 'bugdothouse_ai')
                or
                (game.side_to_move == SideToMove.BLACK.value
                 and game.black_player.username == 'bugdothouse_ai'))

    async def make_move_on_board(self, board, game, from_sq=None, to_sq=None, piece=None, promotion=None,
                                 is_ai_move=False):
        if is_ai_move:
            legal_moves = list(board.legal_moves)
            move = random.choice(legal_moves)

        else:
            if from_sq:  # move from board
                move = chess.Move.from_uci(from_sq + to_sq + (promotion if promotion else ''))
                is_move_valid = move in board.legal_moves
            else:  # move from pocket
                move = chess.Move.from_uci((piece.upper() if board.turn else piece.lower()) + '@' + to_sq)
                is_move_valid = chess.parse_square(to_sq) in board.legal_drop_squares() and move in board.legal_moves

            if not is_move_valid:
                return None  # todo better returns

        # it's a bughouse capture, we need to make some shenanigans
        if board.is_capture(move) and game.gamemode == GameMode.BUGHOUSE.value:
            brother_game = await self.get_game_async(room_name=self.room_name,
                                                     subgame=2 if game.subgame_id == 1 else 1)

            # add piece to brother game
            captured_piece = board.piece_at(move.to_square)
            prev_pocket_match = re.search(r'\[(.*?)]', brother_game.fen)
            brother_game.fen = re.sub(r'\[(.*?)]',
                                      '[' + prev_pocket_match.group(1) + captured_piece.symbol() + ']',
                                      game.fen)

            await brother_game.asave()

            # make move on game board
            board.push(move)

            # remove the captured piece from current board's pocket
            print(captured_piece.symbol())
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

    async def send_move_to_client(self, game):
        # since pockets can update inbetween turns, all boards need to be fetched
        games = await sync_to_async(list)(Game.objects.filter(code=game.code).order_by('subgame_id'))  # todo VERY redundant query
        game_boards = {}

        # example crazyhouse fen: 'rnbqkbnr/pppp2pp/8/5p2/8/P7/1PPP1PPP/RNBQKBNR[Pp] w KQkq - 0 4'
        for game in games:
            pockets = re.sub(r'^.*?\[(.*?)].*$', r'\1', game.fen)  # cut out everyting but pockets
            no_pocket_fen = re.sub(r'\[.*?]', '', game.fen).replace('[]', '')  # cut out the pockets

            print(type(game.subgame_id), game.subgame_id)

            # casting to str to dodge the strict_map_key=True error
            game_boards[str(game.subgame_id)] = {
                "fen": no_pocket_fen.replace('~', ''),  # todo tilda workaround
                # count each piece in the pocket string, then return as a dict
                "whitePocket": dict(Counter([p for p in pockets if p.isupper()])),
                "blackPocket": dict(Counter([p for p in pockets if p.islower()])),
                "sideToMove": game.side_to_move,
                "gameOver": game.result,
            }

        # remember that status and result can also get changed!
        response_data = {
            "type": "move",
            "status": game.status,
            "result": game.result,
            "boards": game_boards,
        }

        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'game.move', 'message': response_data})

    async def process_move(self, game, board, move_maker=None, move_data=None, is_ai_move=False):
        if not board.is_checkmate() or self.is_game_draw(board):
            if not is_ai_move:
                move = await self.make_move_on_board(board,
                                                     game,
                                                     move_data['from_sq'],
                                                     move_data['to_sq'],
                                                     move_data['piece'],
                                                     move_data['promotion'])
            else:
                move = await self.make_move_on_board(board,
                                                     game,
                                                     is_ai_move=True
                                                     )
            if move is None:
                return 'invalid move'

            game.side_to_move = board.turn
            game.fen = board.fen()
            move_instance = Move(game=game,
                                 player=move_maker,
                                 move=move)
            await move_instance.asave()
        else:
            game.result = self.determine_game_outcome(board).value
            game.status = GameStatus.FINISHED.value

        await game.asave()

    async def handle_player_move(self, data):
        try:
            token = data.get('token')
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            piece = data.get('piece')
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
            'piece': piece,
            'promotion': promotion
        }

        await self.process_move(game, board, player, move_data)
        await self.send_move_to_client(game)

        while self.is_ai_turn_in_game(game):
            ai_player = await User.objects.aget(username='bugdothouse_ai')
            await self.process_move(game,
                                    board,
                                    ai_player,
                                    is_ai_move=True)
            await self.send_move_to_client(game)

    class PlayerRoles(Enum):
        WHITE_PLAYER = 0
        BLACK_PLAYER = 1
        SPECTATOR = 2

    @sync_to_async
    def check_user_in_game_sync(self, game, user):
        return user in game.spectators.all() or game.white_player == user or game.black_player == user

    async def check_user_in_game(self, game, user):
        return await self.check_user_in_game_sync(game, user)

    @sync_to_async
    def remove_user_from_game_sync(self, user, game, from_side):
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
        await self.remove_user_from_game_sync(user, game, from_side)

    async def add_user_to_game(self, user, game, to_side):
        if await sync_to_async(lambda: game.white_player is None)() and to_side == self.PlayerRoles.WHITE_PLAYER.value:
            await sync_to_async(setattr)(game, 'white_player', user)
        elif await sync_to_async(
                lambda: game.black_player is None)() and to_side == self.PlayerRoles.BLACK_PLAYER.value:
            await sync_to_async(setattr)(game, 'black_player', user)
        elif to_side == self.PlayerRoles.SPECTATOR.value:
            await sync_to_async(game.spectators.add)(user)

    async def switch_user_positions(self, user, src_game, dest_game, from_side, to_side):
        if src_game.pk == dest_game.pk:
            dest_game = src_game

        await self.remove_user_from_game(user, src_game, from_side)
        await self.add_user_to_game(user, dest_game, to_side)

        await sync_to_async(src_game.save)()
        if src_game.pk != dest_game.pk:
            await sync_to_async(dest_game.save)()

    async def handle_user_switch(self, data):
        from_subgame = data['fromSubgame']
        from_side = data['fromSide']
        to_subgame = data['toSubgame']
        to_side = data['toSide']
        token = data['token']

        src_game = await self.get_game_async(self.room_name, from_subgame)
        dest_game = await self.get_game_async(self.room_name, to_subgame)

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
        event = data['event']
        subgame = data['toSubgame']
        side = data['toSide']
        token = data['token']

        decoded_token = await self.parse_jwt_token_async(token)
        user_id = decoded_token['user_id']

        user = await self.get_user_async(user_id)
        game = await self.get_game_async(self.room_name, subgame)
        host = await database_sync_to_async(getattr)(game, 'host')
        # host = await self.get_user_async(host.pk)

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
        while self.is_ai_turn_in_game(game):
            ai_player = await User.objects.aget(username='bugdothouse_ai')
            await self.process_move(game,
                                    board,
                                    ai_player,
                                    is_ai_move=True)

    async def handle_game_start(self):
        started_games = await sync_to_async(list)(Game.objects
                                                  .select_related('white_player', 'black_player')
                                                  .filter(code=self.room_name))  # todo make this async

        for game in started_games:
            if self.is_ai_turn_in_game(game):
                ai_player = await User.objects.aget(username='bugdothouse_ai')
                if game.gamemode == GameMode.CLASSICAL.value:
                    board = chess.Board(fen=game.fen)
                else:
                    board = chess.variant.CrazyhouseBoard(fen=game.fen)
                await self.process_move(game, board, ai_player, is_ai_move=True)
                await self.channel_layer.group_send(
                    self.room_group_name, {'type': 'game.start'})
                # while self.is_ai_turn_in_game(game):
                #     await self.handle_ai_turn(game, board)
                #     await self.send_move_to_client(game)
                # TODO WAIT 1 SECOND BETWEEN MOVES

    async def receive(self, text_data=None, bytes_data=None):
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
            elif event_type == 'gameStart':
                await self.handle_game_start()
                await self.channel_layer.group_send(
                    self.room_group_name, {'type': 'game.start'})
            else:
                await self.send(text_data=json.dumps({'message': 'invalid request received'}))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'message': 'invalid json'}))

    async def game_move(self, event):
        move = event['message']
        print(move)
        await self.send(json.dumps(move))

    async def lobby_switch(self, event):
        await self.send(text_data=json.dumps({"type": "lobbySwitch",
                                              "success": True}))

    async def lobby_connect(self, event):
        await self.send(text_data=json.dumps({"type": "connect"}))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({"type": "gameStart"}))
