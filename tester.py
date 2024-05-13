import chess, chess.variant

fen = 'rk6/1P6/8/8/8/8/8/2K5 w q - 0 1'
board = chess.variant.CrazyhouseBoard(fen=fen)
board.push(chess.Move.from_uci('b7a8q'))
print(board)
print()
board.push(chess.Move.from_uci('b8a8'))
print(board)
print(board.fen())
