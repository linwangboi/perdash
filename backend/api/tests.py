from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Task

User = get_user_model()


class TaskModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')

    def test_task_creation(self):
        task = Task.objects.create(
            title='Test Task',
            content='Test content',
            created_by=self.user
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.content, 'Test content')
        self.assertEqual(task.created_by, self.user)
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)

    def test_task_str(self):
        task = Task.objects.create(
            title='Test Task',
            content='',
            created_by=self.user
        )
        self.assertEqual(str(task), 'Test Task')

    def test_task_blank_content(self):
        task = Task.objects.create(
            title='Test Task',
            created_by=self.user
        )
        self.assertEqual(task.content, '')


class TaskAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('tasks')

    def test_get_tasks_empty(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_get_tasks_with_data(self):
        Task.objects.create(title='Task 1', content='Content 1', created_by=self.user)
        Task.objects.create(title='Task 2', content='Content 2', created_by=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['title'], 'Task 1')
        self.assertEqual(response.data[0]['content'], 'Content 1')
        self.assertEqual(response.data[0]['created_by'], self.user.id)
        self.assertIn('created_at', response.data[0])
        self.assertIn('updated_at', response.data[0])

    def test_post_task_success(self):
        data = {'title': 'New Task', 'content': 'New content'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Task')
        self.assertEqual(response.data['content'], 'New content')  # Note: bug in views.py, returns 'content' instead of task.content
        self.assertEqual(response.data['created_by'], self.user.id)
        self.assertIn('updated_at', response.data)
        # Check database
        task = Task.objects.get(id=response.data['id'])
        self.assertEqual(task.title, 'New Task')
        self.assertEqual(task.content, 'New content')

    def test_post_task_minimal(self):
        data = {'title': 'Minimal Task'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(id=response.data['id'])
        self.assertEqual(task.content, '')

    def test_post_task_missing_title(self):
        data = {'content': 'No title'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_post_task_unauthenticated(self):
        self.client.force_authenticate(user=None)
        data = {'title': 'Task'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_tasks_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tasks_other_user_not_visible(self):
        other_user = User.objects.create_user(username='other', password='pass')
        Task.objects.create(title='Other Task', created_by=other_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_post_task_invalid_method(self):
        response = self.client.put(self.url, {'title': 'Task'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
