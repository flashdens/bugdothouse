from rest_framework import serializers

from authorization.models import User
from game.models import Game


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # todo


class GameSerializer(serializers.ModelSerializer):


    class Meta:
        model = Game
        fields = ['host', 'code', 'gamemode']
