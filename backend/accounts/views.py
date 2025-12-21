from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import SharePointCredentials
from .msal_client import get_auth_url, acquire_token_by_code
import logging

logger = logging.getLogger(__name__)

class MsLoginUrlView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        redirect_uri = request.GET.get('redirect_uri')
        if not redirect_uri:
            return Response({"error": "redirect_uri is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        url = get_auth_url(redirect_uri)
        return Response({"url": url})

class MsCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')

        if not code or not redirect_uri:
            return Response({"error": "code and redirect_uri are required"}, status=status.HTTP_400_BAD_REQUEST)

        result = acquire_token_by_code(code, redirect_uri)
        
        if "error" in result:
            return Response({"error": result.get("error_description")}, status=status.HTTP_400_BAD_REQUEST)

        # Extract user info from ID Token
        claims = result.get("id_token_claims")
        if not claims:
             return Response({"error": "No ID token claims found"}, status=status.HTTP_400_BAD_REQUEST)

        email = claims.get("preferred_username") or claims.get("email")
        if not email:
             return Response({"error": "Could not identify user email"}, status=status.HTTP_400_BAD_REQUEST)

        # Get or Create Django User
        user, created = User.objects.get_or_create(username=email)
        
        # Save SharePoint Credentials
        access_token = result.get("access_token")
        refresh_token = result.get("refresh_token")
        expires_in = result.get("expires_in", 3600)
        expires_at = timezone.now() + timedelta(seconds=expires_in)

        SharePointCredentials.objects.update_or_create(
            user=user,
            defaults={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_at": expires_at
            }
        )

        # Generate App Token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "username": user.username,
            "email": email
        })
