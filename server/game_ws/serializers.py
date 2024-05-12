from rest_framework import serializers


class ChessMoveSerializer(serializers.Serializer):
    fromSq = serializers.CharField()
    toSq = serializers.CharField()
    sideToMove = serializers.BooleanField()
    #promotion = serializers.CharField()
