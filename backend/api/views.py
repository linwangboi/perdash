# backend/api/views.py

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from math import ceil

from .models import Task
from .serializers import (
    TaskSerializer,
    CustomUserSerializer,
    UserProfileUpdateSerializer,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema


def get_pagination_and_sort(request, queryset):
    """Helper function to apply pagination and sorting to a queryset"""
    # Sorting
    sort_by = request.GET.get("sort_by", "created_at")  # title or created_at
    order = request.GET.get("order", "desc")  # asc or desc

    valid_sort_fields = ["title", "created_at"]
    if sort_by not in valid_sort_fields:
        sort_by = "created_at"

    if order == "asc":
        queryset = queryset.order_by(sort_by)
    else:
        queryset = queryset.order_by(f"-{sort_by}")

    # Pagination
    page = int(request.GET.get("page", 1))
    limit = int(request.GET.get("limit", 10))

    if page < 1:
        page = 1
    if limit < 1 or limit > 100:
        limit = 10

    total_count = queryset.count()
    total_pages = ceil(total_count / limit)

    start = (page - 1) * limit
    end = start + limit

    paginated_queryset = queryset[start:end]

    return paginated_queryset, {
        "page": page,
        "limit": limit,
        "total_count": total_count,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


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

    paginated_qs, pagination_meta = get_pagination_and_sort(request, tasks_qs)
    serializer = TaskSerializer(paginated_qs, many=True)

    return Response({"results": serializer.data, "pagination": pagination_meta})


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
            type = request.GET.get("view", "")
            # '', today, completed, important, upcoming
            if type == "completed":
                tasks_qs = Task.objects.filter(created_by=user, done=True)
            elif type == "today":
                tasks_qs = Task.objects.filter(
                    created_by=user, created_at__date=timezone.now().date()
                )
            elif type == "important":
                tasks_qs = Task.objects.filter(created_by=user, star=True)
            elif type == "upcoming":
                tasks_qs = Task.objects.filter(
                    created_by=user, created_at__gt=timezone.now()
                )
            else:
                tasks_qs = Task.objects.filter(created_by=user)

            paginated_qs, pagination_meta = get_pagination_and_sort(request, tasks_qs)
            serializer = TaskSerializer(paginated_qs, many=True)

            return Response({"results": serializer.data, "pagination": pagination_meta})

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
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user's profile information"""
    user = request.user
    if request.method == "GET":
        serializer = CustomUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == "PATCH":
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
