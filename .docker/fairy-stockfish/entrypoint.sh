#!/bin/sh
set -e
cp /stockfish/stockfish /usr/bin

if which /usr/sbin/sshd > /dev/null; then
  ssh-keygen -A
  echo "SSH daemon is ready to accept connections"
  /usr/sbin/sshd -D
else
  echo "SSH daemon not found"
  exec "$@"
fi
