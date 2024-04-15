from django.db import models


# Create your models here.

class Move:
    from_sq = models.CharField()
    to_sq = models.CharField()
    side_to_move = models.IntegerField()
