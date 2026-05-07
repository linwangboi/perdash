from celery import shared_task
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .email_client import send_email

User = get_user_model()

@shared_task
def send_verification_email_task(user_id):
    user = User.objects.get(id=user_id)
    token = str(RefreshToken.for_user(user).access_token)
    verification_link = f'{settings.FRONTEND_URL}/verify-email/?token={token}'
    html = f"""
        <h2>Verify your email</h2>
        <p>Click below to verify:</p>
        <a href="{verification_link}">Verify Email</a>
    """
    send_email(
        user.email,
        'Verify your email',
        html,
    )