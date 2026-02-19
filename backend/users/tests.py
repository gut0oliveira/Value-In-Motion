from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile


class UsersEndpointsTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="augusto",
            email="augusto@example.com",
            password="StrongPass123!",
        )
        self.other_user = get_user_model().objects.create_user(
            username="other",
            email="other@example.com",
            password="StrongPass123!",
        )
        self.client.force_authenticate(user=self.user)
        UserProfile.objects.create(user=self.user)
        UserProfile.objects.create(user=self.other_user)

    def test_users_overview_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("users_overview"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_register_user_creates_user_and_profile(self):
        self.client.force_authenticate(user=None)
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "StrongPass123!",
            "preferred_currency": "BRL",
            "timezone": "America/Sao_Paulo",
        }
        response = self.client.post(reverse("users_register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(get_user_model().objects.filter(username="newuser").exists())
        self.assertTrue(UserProfile.objects.filter(user__username="newuser").exists())

    def test_list_profiles_returns_only_authenticated_user(self):
        response = self.client.get(reverse("userprofile_list_create"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["user"], self.user.id)

    def test_create_profile_uses_authenticated_user(self):
        UserProfile.objects.filter(user=self.user).delete()
        payload = {
            "user": self.other_user.id,
            "preferred_currency": "USD",
            "timezone": "America/Sao_Paulo",
        }
        response = self.client.post(reverse("userprofile_list_create"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"], self.user.id)

    def test_cannot_access_other_profile_detail(self):
        other_profile = UserProfile.objects.get(user=self.other_user)
        response = self.client.get(reverse("userprofile_detail", args=[other_profile.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_users_overview(self):
        response = self.client.get(reverse("users_overview"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
