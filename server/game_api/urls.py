from django.urls import path
from .views import RandomPositionView, MakeMoveView

urlpatterns = [
    path('random_position/', RandomPositionView.as_view(), name='random_chess_position'),
    path('move/', MakeMoveView.as_view(), name='make_move'),
]
