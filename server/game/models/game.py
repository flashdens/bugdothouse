from django.db import models
from authorization.models.user import User

from enum import Enum


class Game(models.Model):
    STATUS_CHOICES = [
        ("waiting_for_start", "Waiting for start"),
        ("ongoing", "Ongoing"),
        ("finished", "Finished"),
    ]

    GAMEMODE_CHOICES = [
        ("crazyhouse", "Crazyhouse"),
        ("bughouse", "Bughouse"),
        ("classic", "Classic"),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting_for_start")
    gamemode = models.CharField(max_length=20, choices=GAMEMODE_CHOICES, default="crazyhouse", null=True)
    code = models.CharField(max_length=6, null=True, unique=False)
    is_private = models.BooleanField(default=False, null=False)
    host = models.ForeignKey(User, related_name='host', on_delete=models.SET_NULL, null=True)
    fen = models.CharField(
        max_length=128,

        null=True
    )
    side_to_move = models.CharField(max_length=10, default="WHITE", null=True)
    white_player = models.ForeignKey(User, related_name='white_games', on_delete=models.SET_NULL, null=True)
    black_player = models.ForeignKey(User, related_name='black_games', on_delete=models.SET_NULL, null=True)
    spectators = models.ManyToManyField(User, related_name='spectators', blank=True)

    def __str__(self):
        return f"Game {self.code} - {self.status}"
