# backend/api/views.py

from django.contrib.auth import get_user_model
from django.db import models

from .models import Task
from .serializers import TaskSerializer, CustomUserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema


@extend_schema(
    responses={200: TaskSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def task_search(request):
    query = request.GET.get("q", "")
    if not query:
        return Response(
            {"error": "Query parameter 'q' is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    tasks_qs = Task.objects.filter(created_by=user).filter(
        models.Q(title__icontains=query) | models.Q(content__icontains=query)
    )
    serializer = TaskSerializer(tasks_qs, many=True)
    return Response(serializer.data)


User = get_user_model()


@extend_schema(
    request=TaskSerializer,
    responses={201: TaskSerializer, 400: None},
)
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def tasks(request):

    try:
        if request.method == "POST":
            serializer = TaskSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == "GET":
            user = request.user
            tasks_qs = Task.objects.filter(created_by=user)
            serializer = TaskSerializer(tasks_qs, many=True)
            return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=TaskSerializer,
    responses={200: TaskSerializer, 404: None, 204: None},
)
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk, created_by=request.user)
    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == "PATCH":
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    responses={200: CustomUserSerializer},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user's profile information"""
    serializer = CustomUserSerializer(request.user)
    print(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
