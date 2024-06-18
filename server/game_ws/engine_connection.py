import asyncio
import os

import asyncssh
import chess
import chess.engine
from asgiref.sync import sync_to_async


class EngineConnection:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EngineConnection, cls).__new__(cls)
            cls._instance.__init__()
        return cls._instance

    def __init__(self):
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
        print(args)
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

    async def ping(self):
        await self.engine.ping()

    async def analyse_position(self, board, depth=10):
        await self.connect()
        info = await self.engine.analyse(board, chess.engine.Limit(depth=depth))
        return info

    async def get_engine_move(self, board, depth=10):
        info = await self.analyse_position(board, depth)
        best_move = info["pv"][0] if "pv" in info and info["pv"] else None
        return best_move
