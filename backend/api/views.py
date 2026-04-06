import json

from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Task
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

User = get_user_model()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tasks(request):

    try:
        if request.method == 'POST':
            data = request.data
            title = data.get('title')
            content = data.get('content', '')
            user = request.user
            task = Task.objects.create(
                title=title,
                content=content,
                created_by=user
            )
            return Response({
                'id': task.id,
                'title': task.title,
                'content': task.content,
                'created_by': user.id,
                'updated_at': task.updated_at,
            }, status=201)
        elif request.method == 'GET':
            user = request.user
            tasks = Task.objects.filter(created_by=user).values(
                'id', 'title', 'content', 'created_by', 'created_at', 'updated_at'
            )
            return Response(list(tasks))

    except Exception as e:
        return Response({'error': str(e)}, status=400)

