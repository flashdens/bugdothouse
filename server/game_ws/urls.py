from django.urls import path

from . import views

urlpatterns = [
    path("ws_auth/", views.WebSocketAuthView.as_view(), name="ws_auth")
]
