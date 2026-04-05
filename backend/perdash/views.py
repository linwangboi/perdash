import json

from django.contrib.auth import get_user_model
from django.http import JsonResponse

User = get_user_model()

def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            if User.objects.filter(username=data['username']).exists():
                return JsonResponse({'error': 'User already exists'}, status=400)
            user = User.objects.create_user(
                username=data['username'],
                password=data['password']
            )

            return JsonResponse({'message': 'User created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


