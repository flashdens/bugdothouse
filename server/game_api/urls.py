from django.urls import path
from .views import RandomPositionView

urlpatterns = [
    path('random_position/', RandomPositionView.as_view(), name='random_chess_position'),
]