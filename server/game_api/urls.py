from django.urls import path
from .views import *

urlpatterns = [
    path('test/new_game/', ResetGameView.as_view(), name='reset_game'),
    path('game/<str:game_code>/', GameInfoView.as_view(), name='game_info'),
    path('join/<int:game_id>/', JoinGameView.as_view(), name='join_game'),
    path('new_game/', NewGameView.as_view(), name='new_game'),  # Corrected the syntax
]
