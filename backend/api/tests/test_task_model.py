from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Task

User = get_user_model()


class TaskModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )

    def test_task_creation(self):
        task = Task.objects.create(
            title="Test Task", content="Test content", created_by=self.user
        )
        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.content, "Test content")
        self.assertEqual(task.created_by, self.user)
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)

    def test_task_str(self):
        task = Task.objects.create(title="Test Task", content="", created_by=self.user)
        self.assertEqual(str(task), "Test Task")

    def test_task_blank_content(self):
        task = Task.objects.create(title="Test Task", created_by=self.user)
        self.assertEqual(task.content, "")

    def test_task_done_default_false(self):
        task = Task.objects.create(
            title="Test Task", content="Test content", created_by=self.user
        )
        self.assertFalse(task.done)

    def test_task_done_true(self):
        task = Task.objects.create(
            title="Completed Task",
            content="This task is done",
            created_by=self.user,
            done=True,
        )
        self.assertTrue(task.done)

    def test_task_star_and_done_together(self):
        task = Task.objects.create(
            title="Important Done Task",
            content="Both starred and done",
            created_by=self.user,
            star=True,
            done=True,
        )
        self.assertTrue(task.star)
        self.assertTrue(task.done)
