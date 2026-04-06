# backend/api/views.py

from django.contrib.auth import get_user_model

from .models import Task
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def tasks(request):

    try:
        if request.method == "POST":
            data = request.data
            title = data.get("title")
            content = data.get("content", "")
            user = request.user
            task = Task.objects.create(title=title, content=content, created_by=user)
            return Response(
                {
                    "id": task.id,
                    "title": task.title,
                    "content": task.content,
                    "created_by": user.id,
                    "updated_at": task.updated_at,
                },
                status=status.HTTP_201_CREATED,
            )
        elif request.method == "GET":
            user = request.user
            tasks = Task.objects.filter(created_by=user).values(
                "id", "title", "content", "created_by", "created_at", "updated_at"
            )
            return Response(list(tasks))

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk, created_by=request.user)
    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        return Response(
            {
                "id": task.id,
                "title": task.title,
                "content": task.content,
                "created_by": task.created_by.id,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            },
            status=status.HTTP_200_OK,
        )
    elif request.method == "PATCH":
        if "title" in request.data:
            task.title = request.data["title"]
        if "content" in request.data:
            task.content = request.data["content"]
        task.save()
        return Response(
            {
                "id": task.id,
                "title": task.title,
                "content": task.content,
                "created_by": task.created_by.id,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            },
            status=status.HTTP_200_OK,
        )
    elif request.method == "DELETE":
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
