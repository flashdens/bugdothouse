from django.db import models

from authorization.models import User
from .game import Game


class Move(models.Model):
    """
    Model reprezentujący ruch w grze.

    Atrybuty:
        game (ForeignKey): gra, w której wykonano ruch.
        player (ForeignKey): gracz, który wykonał ruch
        move (str): ruch w notacji UCI.
    """
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    player = models.ForeignKey(User, max_length=100, on_delete=models.CASCADE)
    move = models.CharField(max_length=10)
