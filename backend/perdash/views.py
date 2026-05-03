
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from api.serializers import SignupResponseSerializer, SignupSerializer
from drf_spectacular.utils import extend_schema

User = get_user_model()


@extend_schema(
    request=SignupSerializer,
    responses={201: SignupResponseSerializer, 400: None},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"message": "User created successfully", "email": user.email}, status=201
        )
    return Response({"error": serializer.errors}, status=400)


@extend_schema(
    request=None,
    responses={204: None, 400: None},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def signout(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"error": "Refresh token is required for sign out."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
