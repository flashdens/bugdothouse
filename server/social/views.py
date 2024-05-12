from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from social.serializers import ProfileSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    serializer = ProfileSerializer(user, many=False)
    return Response(serializer.data)
