# backend/api/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path("tasks/", views.tasks, name="tasks"),
    path("tasks/<int:pk>/", views.task_detail, name="task_detail"),
    path("tasks/search/", views.task_search, name="task_search"),
    path("user/profile/", views.user_profile, name="user_profile"),
    path('user/verify_email/', views.verify_email, name='verify_email'),
    path('user/resend_verification_email/', views.resend_verification_email, name='resend_verification_email'),
]
