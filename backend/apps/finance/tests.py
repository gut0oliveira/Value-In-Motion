from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Account, Category, Transaction


class FinanceEndpointsTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="finance-user",
            email="finance@example.com",
            password="StrongPass123!",
        )
        self.other_user = get_user_model().objects.create_user(
            username="other-finance-user",
            email="otherfinance@example.com",
            password="StrongPass123!",
        )
        self.account = Account.objects.create(
            name="Conta Principal",
            account_type="checking",
            owner=self.user,
        )
        self.other_account = Account.objects.create(
            name="Conta Other",
            account_type="checking",
            owner=self.other_user,
        )
        self.category = Category.objects.create(
            name="Salario",
            transaction_type="income",
            owner=self.user,
        )
        self.other_category = Category.objects.create(
            name="Outras Receitas",
            transaction_type="income",
            owner=self.other_user,
        )
        self.client.force_authenticate(user=self.user)

    def test_finance_overview_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("finance_overview"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_finance_overview_authenticated(self):
        response = self.client.get(reverse("finance_overview"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_accounts_returns_only_authenticated_user(self):
        response = self.client.get(reverse("account_list_create"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["owner"], self.user.id)

    def test_list_transactions_returns_only_authenticated_user(self):
        Transaction.objects.create(
            owner=self.user,
            account=self.account,
            category=self.category,
            transaction_type="income",
            description="Salario mensal",
            amount=Decimal("1200.00"),
            occurred_on=date.today(),
        )
        Transaction.objects.create(
            owner=self.other_user,
            account=self.other_account,
            category=self.other_category,
            transaction_type="income",
            description="Outra receita",
            amount=Decimal("500.00"),
            occurred_on=date.today(),
        )
        response = self.client.get(reverse("transaction_list_create"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_transaction_rejects_foreign_account(self):
        payload = {
            "account": self.other_account.id,
            "category": self.category.id,
            "transaction_type": "income",
            "description": "Invalida",
            "amount": "10.00",
            "occurred_on": str(date.today()),
        }
        response = self.client.post(reverse("transaction_list_create"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
