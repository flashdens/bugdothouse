from rest_framework.response import Response
from rest_framework.decorators import api_view

from .serializers import AuthTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

@api_view(['GET'])
def get_routes(request):
    """returns a view containing all the possible routes"""
    routes = [
        '/api/token',
        '/api/token/refresh'
    ]

    return Response(routes)

class AuthTokenObtainPairView(TokenObtainPairView):
    serializer_class = AuthTokenObtainPairSerializer