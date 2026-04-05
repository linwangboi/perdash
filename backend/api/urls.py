


from django.contrib import admin
from django.urls import include, path
from . import views

urlpatterns = [
    path('tasks/', views.post_task, name='post-task'),
]
