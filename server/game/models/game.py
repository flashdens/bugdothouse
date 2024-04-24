from django.db import models


class Game(models.Model):
    status = models.CharField(max_length=20, default="ongoing")
    fen = models.CharField(max_length=71, default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", null=False)
    side_to_move = models.CharField(default="WHITE", null=True)
