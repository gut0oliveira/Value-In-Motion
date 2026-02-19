from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    preferred_currency = serializers.CharField(max_length=3, required=False, default="BRL")
    timezone = serializers.CharField(max_length=64, required=False, default="America/Sao_Paulo")

    def validate_username(self, value):
        user_model = get_user_model()
        if user_model.objects.filter(username=value).exists():
            raise serializers.ValidationError("Usuario ja cadastrado.")
        return value

    def create(self, validated_data):
        user_model = get_user_model()
        password = validated_data.pop("password")
        preferred_currency = validated_data.pop("preferred_currency", "BRL")
        timezone = validated_data.pop("timezone", "America/Sao_Paulo")

        user = user_model.objects.create_user(password=password, **validated_data)
        UserProfile.objects.create(
            user=user,
            preferred_currency=preferred_currency,
            timezone=timezone,
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "id",
            "user",
            "preferred_currency",
            "timezone",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")
