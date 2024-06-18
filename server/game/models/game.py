from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class GameStatus(models.IntegerChoices):
    """
    Enum reprezentujący status gry.

    Wartości:
        WAITING_FOR_START (int): gra oczekuje na rozpoczęcie.
        ONGOING (int): gra jest w toku.
        FINISHED (int): gra zakończona.
    """
    WAITING_FOR_START = (0, 'Waiting for start')
    ONGOING = (1, 'Ongoing')
    FINISHED = (2, 'Finished')


class GameMode(models.IntegerChoices):
    """
    Enum reprezentujący warainy gry.

    Wartości:
        BUGHOUSE (int): bughouse
        CRAZYHOUSE (int): crazyhouse.
        CLASSICAL (int): szachy klasyczne.
    """
    BUGHOUSE = (0, 'Bughouse')
    CRAZYHOUSE = (1, 'Crazyhouse')
    CLASSICAL = (2, 'Classical')


class GameResult(models.IntegerChoices):
    """
    Enum reprezentujący wynik gry.

    Wartości:
        WHITE_WIN (int): wygrana białych.
        BLACK_WIN (int): wygrana czarnych.
        TEAM_1_WIN (int): wygrana drużyny 1.
        TEAM_2_WIN (int): wygrana drużyny 2.
        DRAW (int): remis.
    """
    WHITE_WIN = (1, 'White wins')
    BLACK_WIN = (2, 'Black wins')
    TEAM_1_WIN = (3, 'Team 1 wins')
    TEAM_2_WIN = (4, 'Team 2 wins')
    DRAW = (5, 'Draw')


SUBGAME_ID_CHOICES = [
    (1, "1"),
    (2, "2")
]


class Game(models.Model):
    """
    Model reprezentujący grę.

    Atrybuty:
        status (int): status gry.
        gamemode (int): rryb gry.
        code (str): unikalny kod gry.
        is_private (bool): widoczność gry na liście gier.
        host (ForeignKey): gospodarz gry.
        fen (str): Pozycja w notacji FEN.
        side_to_move (bool): strona, która ma wykonać ruch.
        white_player (ForeignKey): gracz grający białymi.
        black_player (ForeignKey): gracz grający czarnymi.
        spectators (ManyToManyField): obserwujący grę.
        brother_game (ForeignKey): powiązana gra.
        subgame_id (int): identyfikator podgry.
        result (int): wynik gry.
    """
    status = models.IntegerField(
        choices=GameStatus.choices,
        default=GameStatus.WAITING_FOR_START
    )
    gamemode = models.IntegerField(
        choices=GameMode.choices,
        default=GameMode.CRAZYHOUSE
    )
    code = models.CharField(max_length=6, null=True, unique=False)
    is_private = models.BooleanField(null=False)
    host = models.ForeignKey(User, related_name='host', on_delete=models.SET_NULL, null=True)
    fen = models.CharField(
        max_length=128,
        null=True
    )
    side_to_move = models.BooleanField(default=True, null=True)
    white_player = models.ForeignKey(User, related_name='white_player', on_delete=models.SET_NULL, null=True)
    black_player = models.ForeignKey(User, related_name='black_player', on_delete=models.SET_NULL, null=True)
    spectators = models.ManyToManyField(User, related_name='spectators', blank=True)
    brother_game = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)
    subgame_id = models.IntegerField(choices=SUBGAME_ID_CHOICES, null=False, default=1)
    result = models.IntegerField(null=True, choices=GameResult.choices)  # null -> result undetermined

    def __str__(self):
        """
        Zwraca reprezentację tekstową gry.
        """
        return f"Game {self.code}"
