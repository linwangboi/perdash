from rest_framework import serializers
from .models import CustomUser, Task
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.core.mail import send_mail


class CustomUserSerializer(serializers.ModelSerializer):
    """Read-only serializer for user data"""

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""

    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "content",
            "created_by",
            "created_at",
            "updated_at",
            "star",
            "done",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by"]


class SignupSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ["email", "password", "password2", "first_name", "last_name"]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate(self, data):
        if data["password"] != data.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        token_object = RefreshToken.for_user(user)
        verification_token = str(token_object.access_token)
        verification_link = f'{settings.FRONTEND_URL}/verify-email/?token={verification_token}'
        send_mail(
            'Email Verification',
            f'Please verify your email by clicking this link: {verification_link}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return user


class SignupResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    email = serializers.EmailField()


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name']
        