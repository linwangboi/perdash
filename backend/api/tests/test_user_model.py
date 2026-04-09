from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomUserModelTest(TestCase):
    def test_create_user_success(self):
        user = User.objects.create_user(email="test@gmail.com", password="testpass")
        self.assertEqual(user.email, "test@gmail.com")
        self.assertTrue(user.check_password("testpass"))

    def test_create_user_without_email(self):
        with self.assertRaises(ValueError) as context:
            User.objects.create_user(email="", password="testpass")
        self.assertEqual(str(context.exception), "Email must be provided")

    def test_create_user_with_first_and_last_name(self):
        user = User.objects.create_user(
            email="john@gmail.com",
            password="testpass",
            first_name="John",
            last_name="Doe",
        )
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")

    def test_custom_user_str(self):
        user = User.objects.create_user(email="test@gmail.com", password="testpass")
        self.assertEqual(str(user), "test@gmail.com")

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(
            email="admin@gmail.com", password="adminpass"
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertEqual(superuser.email, "admin@gmail.com")

    def test_create_superuser_with_names(self):
        superuser = User.objects.create_superuser(
            email="admin@gmail.com",
            password="adminpass",
            first_name="Admin",
            last_name="User",
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertEqual(superuser.first_name, "Admin")
        self.assertEqual(superuser.last_name, "User")

    def test_user_is_verified_default_false(self):
        user = User.objects.create_user(email="test@gmail.com", password="testpass")
        self.assertFalse(user.is_verified)

    def test_email_unique_constraint(self):
        User.objects.create_user(email="test@gmail.com", password="testpass")
        with self.assertRaises(Exception):
            User.objects.create_user(email="test@gmail.com", password="otherpass")
