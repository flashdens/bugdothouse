from rest_framework import serializers
from game.models import Game, GameMode
from authorization.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # Adjust fields as necessary


class GameSerializer(serializers.ModelSerializer):
    host = UserSerializer()

    class Meta:
        model = Game
        fields = ['host', 'code']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.gamemode == GameMode.BUGHOUSE.value:
            representation['maxPlayers'] = 4
        else:
            representation['maxPlayers'] = 2

        # Calculate current_players for the original instance
        current_players = 0
        if instance.white_player is not None:
            current_players += 1
        if instance.black_player is not None:
            current_players += 1
        representation['currentPlayers'] = current_players

        if instance.gamemode == GameMode.BUGHOUSE.value:
            print(instance.code)
            subgame = Game.objects.get(code=instance.code, subgame_id=2)
            subgame_current_players = 0
            if subgame.white_player is not None:
                subgame_current_players += 1
            if subgame.black_player is not None:
                subgame_current_players += 1

        return representation
