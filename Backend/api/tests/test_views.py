from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from api.models import Project, Task, Profile
from datetime import datetime

class UserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = reverse('signup')

    def test_user_signup(self):
        data = {
            "first_name": "John",
            "email": "john@example.com",
            "password": "password123",
            "confirm_password": "password123"
        }
        response = self.client.post(self.signup_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Account created successfully')

    def test_signup_password_mismatch(self):
        data = {
            "first_name": "Jane",
            "email": "jane@example.com",
            "password": "password123",
            "confirm_password": "wrongpassword"
        }
        response = self.client.post(self.signup_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class LoginTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="JohnDoe", email="john@example.com", password="password123"
        )
        self.login_url = reverse('signin')

    def test_login_success(self):
        data = {"email": "john@example.com", "password": "password123"}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_invalid_password(self):
        data = {"email": "john@example.com", "password": "wrongpassword"}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('message', response.data)

class ProjectTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="JaneDoe", email="jane@example.com", password="password123"
        )
        self.client.force_authenticate(user=self.user)
        self.create_project_url = reverse('create_project')

    def test_create_project(self):
        data = {"title": "New Project"}
        response = self.client.post(self.create_project_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "New Project")

    def test_create_project_no_title(self):
        response = self.client.post(self.create_project_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class TaskTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="TaskUser", email="task@example.com", password="taskpassword"
        )
        self.client.force_authenticate(user=self.user)
        self.project = Project.objects.create(
            title="Test Project", created_by=self.user, created_date=datetime.now()
        )
        self.add_task_url = reverse('add_task', kwargs={'project_id': self.project.id})

    def test_add_task(self):
        data = {"description": "New Task"}
        response = self.client.post(self.add_task_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['description'], "New Task")

    def test_add_task_no_description(self):
        response = self.client.post(self.add_task_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
