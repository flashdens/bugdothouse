from rest_framework import serializers

from authorization.models import User
from game.models import Game


class SpectatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # todo
