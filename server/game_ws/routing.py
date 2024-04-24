from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path(r"ws/test/", consumers.GameConsumer.as_asgi()),
]
