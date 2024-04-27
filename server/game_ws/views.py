from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status

from game.models import User


class WebSocketAuthView(APIView):
    # TODO add password in the future! is such auth safe anyway?
    def post(self, request):
        if request.method == 'POST':
            username = request.data.get('username')
            try:
                user = get_object_or_404(User, username=username)
                return Response({'message': f'{user.username} authenticated successfully',
                                 'uuid': user.uuid}, status=status.HTTP_200_OK)

            except Http404:
                return Response({'message': 'auth failed. TODO anonymous users', 'uuid': None}, status=status.HTTP_404_NOT_FOUND)
