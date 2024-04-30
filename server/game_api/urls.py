from django.urls import path
from .views import *

urlpatterns = [
    path('test/new_game/', NewGameView.as_view(), name='new_game'),
    path('test/game_info/', GameInfoView.as_view(), name='game_info')
]
