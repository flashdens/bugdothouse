from django.db import models
from authorization.models.user import User


class Game(models.Model):
    STATUS_CHOICES = [
        ("ongoing", "Ongoing"),
        ("finished", "Finished"),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ongoing")
    fen = models.CharField(max_length=128, default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                           null=False)
    side_to_move = models.CharField(default="WHITE", null=True)
    white_player = models.ForeignKey(User, related_name='white_games', on_delete=models.SET_NULL, null=True)
    black_player = models.ForeignKey(User, related_name='black_games', on_delete=models.SET_NULL, null=True)