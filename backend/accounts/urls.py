from django.urls import path
from .views import MsLoginUrlView, MsCallbackView

urlpatterns = [
    path('ms-url/', MsLoginUrlView.as_view(), name='ms-login-url'),
    path('callback/', MsCallbackView.as_view(), name='ms-callback'),
]
