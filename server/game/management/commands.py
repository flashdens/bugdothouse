from django.core.management.base import BaseCommand
from game.models import Game, GameStatus


class Command(BaseCommand):
    help = 'Deletes empty games that are waiting for start'

    def handle(self, *args, **kwargs):
        empty_games = Game.objects.filter(
            status=GameStatus.WAITING_FOR_START,
            black_player=None,
            spectators=None
        )
        deleted_count = empty_games.delete().count()
        self.stdout.write(f'Cleared {deleted_count} empty games')
