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
