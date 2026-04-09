from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.serializers import SignupSerializer

User = get_user_model()


@api_view(["POST"])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"message": "User created successfully", "email": user.email}, status=201
        )
    return Response({"error": serializer.errors}, status=400)
