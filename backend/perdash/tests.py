from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class SignupAPITest(APITestCase):
    def setUp(self):
        self.url = reverse("signup")

    def test_signup_success(self):
        data = {
            "email": "test@gmail.com",
            "password": "testpass",
            "password2": "testpass",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "User created successfully")
        self.assertTrue(User.objects.filter(email="test@gmail.com").exists())

    def test_signup_duplicate_user(self):
        user = User.objects.create_user(email="test@gmail.com", password="testpass")
        data = {
            "email": "test@gmail.com",
            "password": "duplicate",
            "password2": "duplicate",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_signup_invalid_json(self):
        response = self.client.post(self.url, data="invalid-json", format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_passwords_dont_match(self):
        data = {
            "email": "test@gmail.com",
            "password": "testpass123",
            "password2": "differentpass123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_signup_with_optional_names(self):
        data = {
            "email": "john@gmail.com",
            "password": "testpass123",
            "password2": "testpass123",
            "first_name": "John",
            "last_name": "Doe",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="john@gmail.com")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
