from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Task

User = get_user_model()


class TaskGetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@gmailcom", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.task = Task.objects.create(
            title="Test Task", content="Test Content", created_by=self.user
        )
        self.url = reverse("task_detail", args=[self.task.id])

    def test_get_task_detail(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = response.data
        self.assertEqual(task["title"], "Test Task")
        self.assertEqual(task["content"], "Test Content")
        self.assertEqual(task["created_by"], self.user.id)
        self.assertFalse(task["star"])  # Check default star value

    def test_task_not_exist(self):
        response = self.client.get(reverse("task_detail", args=[100]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        error = response.data
        self.assertEqual(error["error"], "Task not found")


class TaskPatchTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )
        self.client.force_authenticate(user=self.user)
        self.task = Task.objects.create(
            title="Test Task", content="Test Content", created_by=self.user
        )
        self.url = reverse("task_detail", args=[self.task.id])

    def test_patch_task_detail_title(self):
        response = self.client.patch(
            self.url, {"title": "Updated Title"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = response.data
        self.assertEqual(task["title"], "Updated Title")
        self.assertEqual(task["content"], "Test Content")

    def test_patch_task_detail_content(self):
        response = self.client.patch(
            self.url, {"content": "Updated content"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = response.data
        self.assertEqual(task["title"], "Test Task")
        self.assertEqual(task["content"], "Updated content")

    def test_patch_task_detail_star(self):
        response = self.client.patch(self.url, {"star": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task = response.data
        self.assertTrue(task["star"])
        # Check database
        self.task.refresh_from_db()
        self.assertTrue(self.task.star)


class TaskDeleteTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )
        self.client.force_authenticate(user=self.user)
        self.task = Task.objects.create(
            title="Test Task", content="Test Content", created_by=self.user
        )
        self.url = reverse("task_detail", args=[self.task.id])

    def test_delete_task(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())
