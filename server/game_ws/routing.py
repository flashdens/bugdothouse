from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/(?P<game_code>\w+)/$", consumers.GameConsumer.as_asgi()),
]
