from django.db import models
from django.contrib.auth.models import User

class SharePointCredentials(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='sharepoint_credentials')
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"OAuth Credentials for {self.user.username}"
