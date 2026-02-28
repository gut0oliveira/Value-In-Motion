from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class HealthCheckTests(APITestCase):
    def test_health_check_returns_ok(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")

    def test_token_obtain_pair(self):
        get_user_model().objects.create_user(
            username="token-user",
            email="token@example.com",
            password="StrongPass123!",
        )
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "token-user", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
