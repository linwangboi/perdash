from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

class SignupAPITest(APITestCase):
    def setUp(self):
        self.url = reverse('signup')
    def test_signup_success(self):
        data = {
            'username': 'testuser',
            'password': 'testpass',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'User created')
        self.assertTrue(User.objects.filter(username='testuser').exists())
    def test_signup_duplicate_user(self):
        user = User.objects.create_user(username='testuser', password='testpass')
        data = {
            'username': 'testuser',
            'password': 'duplicate',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    def test_signup_invalid_json(self):
        response = self.client.post(
            self.url,
            data='invalid-json',
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)



