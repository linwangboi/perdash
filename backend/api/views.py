import json

from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse

from .models import Task

User = get_user_model()

def index(request):
    return HttpResponse('Hello world!')

def post_task(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content', '')
            user_id = data.get('user_id')
            user = User.objects.get(id=user_id)
            task = Task.objects.create(
                title=title,
                content=content,
                created_by=user
            )
            return JsonResponse({
                'id': task.id,
                'title': task.title,
                'content': task.content,
                'created_by': user_id,
                'created_at': task.created_at,
                'updated_at': task.updated_at,
            })

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)