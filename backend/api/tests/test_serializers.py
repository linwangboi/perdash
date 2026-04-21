from django.test import TestCase
from django.contrib.auth import get_user_model
from api.serializers import SignupSerializer, CustomUserSerializer, TaskSerializer
from api.models import Task

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


class TaskSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )

    def test_task_serializer_default_done_false(self):
        task = Task.objects.create(
            title="Test Task", content="Test content", created_by=self.user
        )
        serializer = TaskSerializer(task)
        data = serializer.data
        self.assertFalse(data["done"])
        self.assertEqual(data["title"], "Test Task")
        self.assertEqual(data["content"], "Test content")

    def test_task_serializer_done_true(self):
        task = Task.objects.create(
            title="Completed Task",
            content="This task is done",
            created_by=self.user,
            done=True,
        )
        serializer = TaskSerializer(task)
        data = serializer.data
        self.assertTrue(data["done"])

    def test_task_serializer_all_fields(self):
        task = Task.objects.create(
            title="Full Task",
            content="Full content",
            created_by=self.user,
            star=True,
            done=True,
        )
        serializer = TaskSerializer(task)
        data = serializer.data
        self.assertIn("id", data)
        self.assertEqual(data["title"], "Full Task")
        self.assertEqual(data["content"], "Full content")
        self.assertEqual(data["created_by"], self.user.id)
        self.assertTrue(data["star"])
        self.assertTrue(data["done"])
        self.assertIn("created_at", data)
        self.assertIn("updated_at", data)

    def test_task_serializer_write_done(self):
        data = {
            "title": "New Task",
            "content": "New content",
            "done": True,
            "star": False,
        }
        serializer = TaskSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        task = serializer.save(created_by=self.user)
        self.assertTrue(task.done)
        self.assertEqual(task.title, "New Task")

    def test_task_serializer_update_done(self):
        task = Task.objects.create(
            title="Task to Update",
            content="Original content",
            created_by=self.user,
            done=False,
        )
        data = {"done": True}
        serializer = TaskSerializer(task, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_task = serializer.save()
        self.assertTrue(updated_task.done)
        self.assertEqual(updated_task.title, "Task to Update")
