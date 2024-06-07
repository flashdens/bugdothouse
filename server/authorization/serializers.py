from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

from .models import User, UserManager


class AuthTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    consent = serializers.BooleanField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'consent')

    def validate(self, attrs):
        if not attrs['consent']:
            raise serializers.ValidationError({"consent": "You must agree to the website rules."})

        return attrs

    def create(self, validated_data):
        user_manager = UserManager()
        user = user_manager.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.save()

        return user
