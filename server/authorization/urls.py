from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import AuthTokenObtainPairView, RegisterView

urlpatterns = [
    path('token/', AuthTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register')
]
