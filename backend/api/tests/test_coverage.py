"""
Additional tests for complete coverage
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Task

User = get_user_model()


class TaskViewFilterTest(APITestCase):
    """Tests for task view filtering (completed, today, important, upcoming)"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("tasks")
        Task.objects.create(title="Completed Task", done=True, created_by=self.user)
        Task.objects.create(title="Important Task", star=True, created_by=self.user)
        Task.objects.create(title="Normal Task", created_by=self.user)

    def test_get_tasks_completed_filter(self):
        """Test getting only completed tasks"""
        response = self.client.get(f"{self.url}?view=completed")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_get_tasks_important_filter(self):
        """Test getting only starred tasks"""
        response = self.client.get(f"{self.url}?view=important")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_get_tasks_today_filter(self):
        """Test getting today's tasks"""
        response = self.client.get(f"{self.url}?view=today")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data["results"]), 0)

    def test_get_tasks_upcoming_filter(self):
        """Test getting upcoming tasks"""
        response = self.client.get(f"{self.url}?view=upcoming")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserProfilePatchTest(APITestCase):
    """Tests for PATCH endpoint on user profile"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com",
            password="testpass",
            first_name="John",
            last_name="Doe",
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("user_profile")

    def test_patch_user_profile_first_name(self):
        """Test updating user's first name"""
        response = self.client.patch(
            self.url,
            {"first_name": "Jane"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Jane")

    def test_patch_user_profile_both_names(self):
        """Test updating both names"""
        response = self.client.patch(
            self.url,
            {"first_name": "Jane", "last_name": "Smith"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Jane")
        self.assertEqual(response.data["last_name"], "Smith")

    def test_patch_user_profile_invalid_data(self):
        """Test PATCH with data that exceeds field length limits"""
        # first_name and last_name have max_length=150
        very_long_name = "A" * 151
        response = self.client.patch(
            self.url,
            {"first_name": very_long_name},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("first_name", response.data)
