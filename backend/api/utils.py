from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings

def send_verification_email(user):
    token_object = RefreshToken.for_user(user)
    verification_token = str(token_object.access_token)
    verification_link = f'{settings.FRONTEND_URL}/verify-email/?token={verification_token}'
    send_mail(
        'Email Verification',
        f'Please verify your email by clicking this link: {verification_link}',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    return
