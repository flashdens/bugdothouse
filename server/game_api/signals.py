from django.db.models.signals import post_save
from django.dispatch import receiver
from game.models import Game


@receiver(post_save, sender=Game)
def share_spectators(sender, instance, created, **kwargs):
    if created:
        brother_games = Game.objects.filter(code=instance.code).exclude(id=instance.id)
        if brother_games.exists():
            reference_game = brother_games.first()
            instance.spectators.set(reference_game.spectators.all())
        else:
            pass
    else:
        # If the game is being updated, ensure all games with the same code share the same spectators
        brother_games = Game.objects.filter(code=instance.code).exclude(id=instance.id)
        for game in brother_games:
            game.spectators.set(instance.spectators.all())
