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

    SUBGAME_ID_CHOICES = [
        (1, "1"),
        (2, "2")
    ]

    class GameOutcomes(models.IntegerChoices):
        WHITE_WIN = 0, 'White Wins'
        BLACK_WIN = 1, 'Black Wins'
        TEAM_1_WIN = 2, 'Team 1 Wins'
        TEAM_2_WIN = 3, 'Team 2 Wins'
        DRAW = 4, 'Draw',

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting_for_start")
    gamemode = models.CharField(max_length=20, choices=GAMEMODE_CHOICES, default="crazyhouse", null=True)
    code = models.CharField(max_length=6, null=True, unique=False)
    is_private = models.BooleanField(null=False)
    host = models.ForeignKey(User, related_name='host', on_delete=models.SET_NULL, null=True)
    fen = models.CharField(
        max_length=128,
        null=True
    )
    side_to_move = models.BooleanField(default=True, null=True)
    white_player = models.ForeignKey(User, related_name='white_games', on_delete=models.SET_NULL, null=True)
    black_player = models.ForeignKey(User, related_name='black_games', on_delete=models.SET_NULL, null=True)
    spectators = models.ManyToManyField(User, related_name='spectators', blank=True)
    brother_game = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)
    subgame_id = models.IntegerField(choices=SUBGAME_ID_CHOICES, null=False, default=1)
    result = models.IntegerField(null=True, choices=GameOutcomes.choices)  # null -> result undetermined

    def __str__(self):
        return f"Game {self.code} - {self.status}"
