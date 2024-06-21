import asyncio
import os
import random

import asyncssh
import chess
import chess.engine
from asgiref.sync import sync_to_async


class EngineConnection:
    """
    Klasa obsługująca połączenie z silnikiem szachowym.
    """

    def __init__(self):
        """
        Konstruktor klasy, wywołujący metodę .connect()
        """
        self.host = 'bugdothouse_fairy-stockfish'
        self.port = os.environ.get('ENGINE_SSH_PORT')
        self.username = os.environ.get("ENGINE_SSH_USER")
        self.password = os.environ.get("ENGINE_SSH_PASSWORD")
        self.conn = None
        self.channel = None
        self.engine = None

        if not self.conn:
            self.connect()

    async def connect(self, *args):
        """
        Metoda nawiązująca połączenie z silnikiem.
        """
        # args are for additional lines to send to the engine after init
        if not self.conn:
            try:
                self.conn = await asyncssh.connect("bugdothouse_fairy-stockfish",
                                                   username=os.environ.get("ENGINE_SSH_USER", "root"),
                                                   password=os.environ.get("ENGINE_SSH_PASSWORD", "password"),
                                                   # port=os.environ.get("ENGINE_SSH_PORT", 22),
                                                   known_hosts=None
                                                   )
                self.channel, self.engine = await self.conn.create_subprocess(chess.engine.UciProtocol,
                                                                              "/stockfish/stockfish")
                await self.engine.initialize()
                for arg in args:
                    await sync_to_async(self.engine.send_line)(arg)

            except Exception as e:
                self.channel = None
                self.engine = None
                raise e

    async def analyse_position(self, board, depth=5):
        """
        Metoda wysyłająca łańcuch FEN do silnika, zwracająca informację nt. wybranego ruchu.
        W przypadku błędu silnika zwraca losowy, legalny ruch.
        """
        try:
            await self.connect()
            info = await self.engine.analyse(board, chess.engine.Limit(depth=depth))
            print(type(info["pv"][0]))
            return info
        except chess.EngineError:  # sometimes even engines break...
            legal_moves = list(board.legal_moves)  # if so, make a random legal move like nothing happened
            random_move = random.choice(legal_moves)
            return random_move

    async def get_engine_move(self, board, depth=5):
        """
        Metoda owijająca .analyse_position(). Wycina łańcuch UCI najlepszego posunięcia z informacji o ruchu, a następnie go zwraca
        """
        info = await self.analyse_position(board, depth)
        best_move = info["pv"][0] if "pv" in info["pv"] else info
        return best_move
