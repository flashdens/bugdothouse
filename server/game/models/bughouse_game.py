
from django.db import models
from game.models import Game


class Bughouse(models.Model):
    STATUS_CHOICES = [
        ("waiting_for_start", "Waiting for start"),
        ("ongoing", "Ongoing"),
        ("finished", "Finished"),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting_for_start")
    game1 = models.ForeignKey(Game, related_name='game1', on_delete=models.SET_NULL, null=True)
    game2 = models.ForeignKey(Game, related_name='game2', on_delete=models.SET_NULL, null=True)

