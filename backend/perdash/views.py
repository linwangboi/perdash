
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

User = get_user_model()


@api_view(["POST"])
def signup(request):
    try:
        data = request.data
        if User.objects.filter(username=data["username"]).exists():
            return Response({"error": "User already exists"}, status=400)
        user = User.objects.create_user(
            username=data["username"], password=data["password"]
        )

        return Response({"message": "User created"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)