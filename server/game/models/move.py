from django.db import models

from .game import Game


class Move(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    player = models.CharField(max_length=100)
    move = models.CharField(max_length=10)
