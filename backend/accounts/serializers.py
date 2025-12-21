from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SharePointCredentials

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class SharePointCredentialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharePointCredentials
        fields = ['client_id', 'client_secret', 'tenant_id']
