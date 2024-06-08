from django.urls import path
from .views import *

urlpatterns = [
    path('new_game/', NewGameView.as_view(), name='new_game'),
    path('<str:game_code>/join/', JoinGameView.as_view(), name='join_game'),
    path('<str:game_code>/info/', GameInfoView.as_view(), name='game_info'),
    path('<str:game_code>/start/', StartGameView.as_view(), name='game_start'),
    path('games/', PublicGameListView.as_view(), name='games')
]
