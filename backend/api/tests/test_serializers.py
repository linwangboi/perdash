from django.test import TestCase
from django.contrib.auth import get_user_model
from api.serializers import SignupSerializer, CustomUserSerializer

User = get_user_model()


class SignupSerializerTest(TestCase):
    def test_signup_serializer_valid_data(self):
        data = {
            "email": "test@gmail.com",
            "password": "testpass123",
            "password2": "testpass123",
            "first_name": "John",
            "last_name": "Doe",
        }
        serializer = SignupSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, "test@gmail.com")
        self.assertTrue(user.check_password("testpass123"))

    def test_signup_serializer_passwords_mismatch(self):
        data = {
            "email": "test@gmail.com",
            "password": "testpass123",
            "password2": "differentpass123",
        }
        serializer = SignupSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)
        self.assertIn("Passwords do not match", str(serializer.errors["password"]))

    def test_signup_serializer_optional_names(self):
        data = {
            "email": "test@gmail.com",
            "password": "testpass123",
            "password2": "testpass123",
        }
        serializer = SignupSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.first_name, "")
        self.assertEqual(user.last_name, "")

    def test_signup_serializer_short_password(self):
        data = {"email": "test@gmail.com", "password": "short", "password2": "short"}
        serializer = SignupSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_signup_serializer_missing_email(self):
        data = {"password": "testpass123", "password2": "testpass123"}
        serializer = SignupSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)


class CustomUserSerializerTest(TestCase):
    def test_custom_user_serializer_read_only(self):
        user = User.objects.create_user(
            email="test@gmail.com",
            password="testpass",
            first_name="John",
            last_name="Doe",
        )
        serializer = CustomUserSerializer(user)
        data = serializer.data
        self.assertEqual(data["email"], "test@gmail.com")
        self.assertEqual(data["first_name"], "John")
        self.assertEqual(data["last_name"], "Doe")
        self.assertFalse(data["is_verified"])
        self.assertIn("id", data)
        self.assertIn("date_joined", data)

    def test_custom_user_serializer_date_joined_readonly(self):
        user = User.objects.create_user(email="test@gmail.com", password="testpass")
        serializer = CustomUserSerializer(user)
        self.assertIn("date_joined", serializer.data)
