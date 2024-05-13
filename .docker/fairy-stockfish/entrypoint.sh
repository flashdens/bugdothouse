#!/bin/sh
set -e

if [ -z "$1" ]; then
  tcpserver -c2 0 23249 /stockfish/stockfish
  echo "fairy-stockfish TCP server is ready to accept connections"
else
  # else default to run whatever the user wanted like "bash" or "sh"
  exec "$@"
fi