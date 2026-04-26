from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Task
from unittest.mock import patch

User = get_user_model()


class TaskAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("tasks")

    def test_get_tasks_empty(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIn("pagination", response.data)
        self.assertEqual(response.data["results"], [])
        self.assertEqual(response.data["pagination"]["total_count"], 0)

    def test_get_tasks_with_data(self):
        Task.objects.create(title="Task 1", content="Content 1", created_by=self.user)
        Task.objects.create(title="Task 2", content="Content 2", created_by=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["pagination"]["total_count"], 2)
        self.assertEqual(
            response.data["results"][0]["title"], "Task 2"
        )  # Most recent first (desc)
        self.assertEqual(response.data["results"][1]["title"], "Task 1")
        self.assertFalse(response.data["results"][0]["star"])
        self.assertFalse(response.data["results"][0]["done"])

    def test_post_task_success(self):
        data = {"title": "New Task", "content": "New content"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Task")
        self.assertEqual(response.data["content"], "New content")
        self.assertEqual(response.data["created_by"], self.user.id)
        self.assertFalse(response.data["star"])
        self.assertFalse(response.data["done"])
        self.assertIn("updated_at", response.data)
        # Check database
        task = Task.objects.get(id=response.data["id"])
        self.assertEqual(task.title, "New Task")
        self.assertEqual(task.content, "New content")
        self.assertFalse(task.star)
        self.assertFalse(task.done)

    def test_post_task_minimal(self):
        data = {"title": "Minimal Task"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(id=response.data["id"])
        self.assertEqual(task.content, "")
        self.assertFalse(task.done)

    def test_post_task_with_done_true(self):
        data = {"title": "Completed Task", "content": "Already done", "done": True}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["done"])
        task = Task.objects.get(id=response.data["id"])
        self.assertTrue(task.done)

    def test_post_task_with_star_and_done(self):
        data = {
            "title": "Important Done Task",
            "content": "Both starred and done",
            "star": True,
            "done": True,
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["star"])
        self.assertTrue(response.data["done"])
        task = Task.objects.get(id=response.data["id"])
        self.assertTrue(task.star)
        self.assertTrue(task.done)

    def test_tasks_exception_handling(self):
        """Test that exception in tasks view is caught and handled"""
        with patch("api.views.Task.objects.filter") as mock_filter:
            mock_filter.side_effect = Exception("Database error")
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("error", response.data)

    def test_post_task_with_exception(self):
        """Test exception handling during POST request"""
        with patch("api.views.TaskSerializer.save") as mock_save:
            mock_save.side_effect = Exception("Save error")
            data = {"title": "New Task", "content": "Content"}
            response = self.client.post(self.url, data, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("error", response.data)

    def test_post_task_missing_title(self):
        data = {"content": "No title"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_task_unauthenticated(self):
        self.client.force_authenticate(user=None)
        data = {"title": "Task"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_tasks_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tasks_other_user_not_visible(self):
        other_user = User.objects.create_user(email="other@gmail.com", password="pass")
        Task.objects.create(title="Other Task", created_by=other_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)

    def test_post_task_invalid_method(self):
        response = self.client.put(self.url, {"title": "Task"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    # Pagination and Sorting Tests
    def test_pagination_default(self):
        """Test default pagination (page 1, limit 10)"""
        for i in range(15):
            Task.objects.create(
                title=f"Task {i}", content=f"Content {i}", created_by=self.user
            )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)
        self.assertEqual(response.data["pagination"]["page"], 1)
        self.assertEqual(response.data["pagination"]["limit"], 10)
        self.assertEqual(response.data["pagination"]["total_count"], 15)
        self.assertEqual(response.data["pagination"]["total_pages"], 2)
        self.assertTrue(response.data["pagination"]["has_next"])
        self.assertFalse(response.data["pagination"]["has_prev"])

    def test_pagination_page_2(self):
        """Test pagination page 2"""
        for i in range(15):
            Task.objects.create(
                title=f"Task {i}", content=f"Content {i}", created_by=self.user
            )
        response = self.client.get(f"{self.url}?page=2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["pagination"]["page"], 2)
        self.assertFalse(response.data["pagination"]["has_next"])
        self.assertTrue(response.data["pagination"]["has_prev"])

    def test_pagination_custom_limit(self):
        """Test pagination with custom limit"""
        for i in range(25):
            Task.objects.create(
                title=f"Task {i}", content=f"Content {i}", created_by=self.user
            )
        response = self.client.get(f"{self.url}?limit=5&page=1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["pagination"]["limit"], 5)
        self.assertEqual(response.data["pagination"]["total_pages"], 5)

    def test_sort_by_title_asc(self):
        """Test sorting by title ascending"""
        Task.objects.create(title="Zebra", content="Z", created_by=self.user)
        Task.objects.create(title="Apple", content="A", created_by=self.user)
        Task.objects.create(title="Banana", content="B", created_by=self.user)
        response = self.client.get(f"{self.url}?sort_by=title&order=asc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["title"], "Apple")
        self.assertEqual(response.data["results"][1]["title"], "Banana")
        self.assertEqual(response.data["results"][2]["title"], "Zebra")

    def test_sort_by_title_desc(self):
        """Test sorting by title descending"""
        Task.objects.create(title="Zebra", content="Z", created_by=self.user)
        Task.objects.create(title="Apple", content="A", created_by=self.user)
        Task.objects.create(title="Banana", content="B", created_by=self.user)
        response = self.client.get(f"{self.url}?sort_by=title&order=desc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["title"], "Zebra")
        self.assertEqual(response.data["results"][1]["title"], "Banana")
        self.assertEqual(response.data["results"][2]["title"], "Apple")

    def test_sort_by_created_at_asc(self):
        """Test sorting by created_at ascending"""
        t1 = Task.objects.create(title="Task 1", created_by=self.user)
        t2 = Task.objects.create(title="Task 2", created_by=self.user)
        t3 = Task.objects.create(title="Task 3", created_by=self.user)
        response = self.client.get(f"{self.url}?sort_by=created_at&order=asc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["id"], t1.id)
        self.assertEqual(response.data["results"][1]["id"], t2.id)
        self.assertEqual(response.data["results"][2]["id"], t3.id)

    def test_sort_by_created_at_desc(self):
        """Test sorting by created_at descending (default)"""
        t1 = Task.objects.create(title="Task 1", created_by=self.user)
        t2 = Task.objects.create(title="Task 2", created_by=self.user)
        t3 = Task.objects.create(title="Task 3", created_by=self.user)
        response = self.client.get(f"{self.url}?sort_by=created_at&order=desc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["id"], t3.id)
        self.assertEqual(response.data["results"][1]["id"], t2.id)
        self.assertEqual(response.data["results"][2]["id"], t1.id)

    def test_invalid_page_defaults_to_1(self):
        """Test that invalid page number defaults to page 1"""
        for i in range(5):
            Task.objects.create(title=f"Task {i}", created_by=self.user)
        response = self.client.get(f"{self.url}?page=0")
        self.assertEqual(response.data["pagination"]["page"], 1)
        response = self.client.get(f"{self.url}?page=-1")
        self.assertEqual(response.data["pagination"]["page"], 1)

    def test_invalid_limit_defaults_to_10(self):
        """Test that invalid limit defaults to 10"""
        for i in range(5):
            Task.objects.create(title=f"Task {i}", created_by=self.user)
        response = self.client.get(f"{self.url}?limit=0")
        self.assertEqual(response.data["pagination"]["limit"], 10)
        response = self.client.get(f"{self.url}?limit=150")
        self.assertEqual(response.data["pagination"]["limit"], 10)

    def test_invalid_sort_by_defaults_to_created_at(self):
        """Test that invalid sort_by defaults to created_at"""
        Task.objects.create(title="Task 1", created_by=self.user)
        response = self.client.get(f"{self.url}?sort_by=invalid_field")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should default to created_at ordering

    def test_pagination_and_sort_combined(self):
        """Test pagination and sorting together"""
        for i in range(25):
            Task.objects.create(title=f"Task {chr(65 + i % 26)}", created_by=self.user)
        response = self.client.get(f"{self.url}?sort_by=title&order=asc&page=1&limit=5")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["pagination"]["total_pages"], 5)


class TaskSearchAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@gmail.com", password="testpass"
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("task_search")

    def test_search_tasks_success(self):
        Task.objects.create(
            title="Important Task", content="This is important", created_by=self.user
        )
        Task.objects.create(
            title="Normal Task", content="This is normal", created_by=self.user
        )
        response = self.client.get(self.url + "?q=important")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIn("pagination", response.data)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Important Task")

    def test_search_tasks_case_insensitive(self):
        Task.objects.create(title="Task", content="CONTENT", created_by=self.user)
        response = self.client.get(self.url + "?q=content")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_search_tasks_no_query(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_tasks_other_user_not_visible(self):
        other_user = User.objects.create_user(email="other@gmail.com", password="pass")
        Task.objects.create(title="Other Task", content="Secret", created_by=other_user)
        response = self.client.get(self.url + "?q=Secret")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)

    def test_search_pagination(self):
        """Test search results with pagination"""
        for i in range(15):
            Task.objects.create(
                title=f"Important {i}",
                content="This is important",
                created_by=self.user,
            )
        response = self.client.get(self.url + "?q=important&page=1&limit=5")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["pagination"]["total_count"], 15)
        self.assertEqual(response.data["pagination"]["total_pages"], 3)

    def test_search_with_sorting(self):
        """Test search results with sorting"""
        Task.objects.create(title="Zebra Important", content="Z", created_by=self.user)
        Task.objects.create(title="Apple Important", content="A", created_by=self.user)
        response = self.client.get(self.url + "?q=important&sort_by=title&order=asc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["title"], "Apple Important")
        self.assertEqual(response.data["results"][1]["title"], "Zebra Important")
