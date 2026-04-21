from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class SignOutAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )
        self.signin_url = reverse("token_obtain_pair")
        self.signout_url = reverse("signout")

    def test_signout_revokes_refresh_token(self):
        signin_response = self.client.post(
            self.signin_url,
            {"email": "test@gmail.com", "password": "testpass"},
            format="json",
        )
        self.assertEqual(signin_response.status_code, status.HTTP_200_OK)
        refresh_token = signin_response.data.get("refresh")
        self.assertIsNotNone(refresh_token)

        signout_response = self.client.post(
            self.signout_url,
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(signout_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_signout_requires_refresh_token(self):
        response = self.client.post(self.signout_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_signout_invalid_refresh_token(self):
        """Test exception handling when invalid refresh token is provided"""
        response = self.client.post(
            self.signout_url,
            {"refresh": "invalid_token_that_will_raise_exception"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)


class UserProfileAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com",
            password="testpass",
            first_name="John",
            last_name="Doe",
            is_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("user_profile")

    def test_get_user_profile_authenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data["email"], "test@gmail.com")
        self.assertEqual(data["first_name"], "John")
        self.assertEqual(data["last_name"], "Doe")
        self.assertTrue(data["is_verified"])
        self.assertIn("id", data)
        self.assertIn("date_joined", data)

    def test_get_user_profile_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile_without_first_last_name(self):
        user = User.objects.create_user(email="noname@gmail.com", password="testpass")
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data["email"], "noname@gmail.com")
        self.assertEqual(data["first_name"], "")
        self.assertEqual(data["last_name"], "")
