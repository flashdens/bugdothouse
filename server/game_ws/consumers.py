import json

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

import chess
import chess.variant

from django.shortcuts import get_object_or_404

from game.models import Game, Move, User


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.players = []
        super().__init__(*args, **kwargs)

    async def connect(self):
        self.room_group_name = "game"
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    @sync_to_async
    def determine_side(self, game, user):
        if game.white_player is None or game.white_player.pk == user.pk:
            game.white_player = user
            return 'WHITE'
        elif game.black_player is None or game.black_player.pk == user.pk:
            game.black_player = user
            return 'BLACK'
        else:
            print("spectator")  # todo
            return None

    async def handle_connect(self, data):
        username = data.get('username')
        uuid = data.get('uuid')
        print(username, "connected")
        user = await sync_to_async(get_object_or_404)(User, username=username)

        if user.uuid != uuid:
            print("masz przejebane")

        game = await sync_to_async(get_object_or_404)(Game, pk=1)
        player_side = await self.determine_side(game, user)

        await game.asave()

        await self.send(text_data=json.dumps({'type': 'connection_response',
                                              'message': 'Connected successfully',
                                              'side': player_side}))

    # is nesting async functions even a good idea?
    '''
    def handle_game_ending_move(self, board):
        if board.is_stalemate():
            return 'Stalemate'
        elif board.is_checkmate():
            return 'Win by checkmate!'
        elif board.is_insufficient_material():
            return 'Draw by insufficient material'
        elif board.is_seventyfive_moves():
            return 'Draw by seventy-five moves rule'
        elif board.is_fivefold_repetition():
            return 'Draw by fivefold repetition'
        else:
            return None
        '''

    @database_sync_to_async
    def process_move_in_db(self, data):
        try:
            from_sq = data.get('fromSq')
            to_sq = data.get('toSq')
            piece = data.get('piece')

            game = get_object_or_404(Game, pk=1)

            board = chess.variant.CrazyhouseBoard(fen=game.fen)

            print(game.side_to_move)
            if from_sq:  # move from board
                move = chess.Move.from_uci(from_sq + to_sq)
                is_move_valid = True if move in board.legal_moves else False
                board.push(move)
            else:  # move from pocket
                move = chess.Move.from_uci((piece.upper() if game.side_to_move else piece.lower()) + '@' + to_sq)
                pocket = chess.variant.CrazyhousePocket(piece)  # for testing
                pocket.remove(chess.PIECE_SYMBOLS.index(piece))
                parsed_sq = chess.parse_square(to_sq)
                is_move_valid = True if parsed_sq in board.legal_drop_squares() else False
                board.set_piece_at(parsed_sq, chess.Piece.from_symbol(piece.upper() if game.side_to_move else piece.lower()))

            print(board)
            # emit error to the sender if move is invalid...

            game.side_to_move = board.turn
            game.fen = board.fen().replace('[]', '')  # temporary replacement so chessboard renders
            game.save()

            db_move = Move(game=game,
                           player="TEST",
                           move=move,
                           )
            db_move.save()

            response_data = {
                'type': 'move',
                'error': 'Invalid move' if not is_move_valid else None,
                'gameOver': 'Checkmate' if board.is_checkmate() else None,  # self.handle_game_ending_move,
                'sideToMove': board.turn,
                'fen': board.fen().replace('[]', '')
            }

            print("received", move, "over websocket, success:", is_move_valid)
            return response_data

        except json.JSONDecodeError:
            return {'type': 'error', 'message': 'invalid json'}

    # todo error only locally
    # todo fetch checkmate from game info endpoint
    async def handle_move(self, data):
        response_data = await self.process_move_in_db(data)
        await self.channel_layer.group_send(
            self.room_group_name, {'type': 'game.move', 'message': response_data}
        )

    async def receive(self, text_data=None, bytes_data=None):
        print(text_data)
        try:
            data = json.loads(text_data)
            event_type = data['type']
            print(event_type)
            if event_type == 'connect':
                await self.handle_connect(data)
            elif event_type == 'move':
                await self.handle_move(data)
            else:
                await self.send(text_data=json.dumps({'message': 'invalid request received'}))
                pass

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'message': 'invalid json'}))

    async def game_move(self, event):
        move = event['message']
        await self.send(json.dumps({'message': move}))
