from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .serializers import AuthTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class AuthTokenObtainPairView(TokenObtainPairView):
    """
    Widok pozyskiwania pary żetonów JWT.
    """
    serializer_class = AuthTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    Widok rejestracji użytkownika.
    """
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        """
        Metoda obsługująca zapytanie POST wysłane do widoku.
        Rejestruje użytkownika.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
