from rest_framework import serializers


class ChessPositionSerializer(serializers.Serializer):
    fen = serializers.CharField(max_length=100)
