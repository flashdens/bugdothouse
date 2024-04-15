from rest_framework import serializers


class ChessPositionSerializer(serializers.Serializer):
    fen = serializers.CharField(max_length=100)


class ChessMoveSerializer(serializers.Serializer):
    fromSq = serializers.CharField()
    toSq = serializers.CharField()
    sideToMove = serializers.BooleanField()
    #promotion = serializers.CharField()
