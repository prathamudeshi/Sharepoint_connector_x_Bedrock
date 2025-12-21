from django.urls import path
from .views import ChatView, SharePointFilesView

urlpatterns = [
    path('message', ChatView.as_view(), name='chat-message'),
    path('sharepoint/files', SharePointFilesView.as_view(), name='sharepoint-files'),
]
