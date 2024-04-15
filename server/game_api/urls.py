from django.urls import path
from .views import RandomPositionView, MakeMoveView, NewGameView

urlpatterns = [
    path('test/random_position/', RandomPositionView.as_view(), name='random_chess_position'),
    path('test/move/', MakeMoveView.as_view(), name='make_move'),
    path('test/new_game/', NewGameView.as_view(), name='new_game'),
]
