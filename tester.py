import asyncio
import asyncssh
import chess
import chess.engine


async def main() -> None:
    async with asyncssh.connect("fairy_stockfish:23249") as conn:
        channel, engine = await conn.create_subprocess(chess.engine.UciProtocol, "/stockfish/stockfish")
        await engine.initialize()

        # Play, analyse, ...
        await engine.ping()


asyncio.run(main())
