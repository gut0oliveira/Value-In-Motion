from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Account, Category, CreditCard, Transaction
from .serializers import (
    AccountSerializer,
    CategorySerializer,
    CreditCardSerializer,
    TransactionSerializer,
)


@api_view(["GET"])
def finance_overview(request):
    return Response(
        {
            "module": "finance",
            "endpoints": {
                "accounts": "/api/finance/accounts/",
                "categories": "/api/finance/categories/",
                "transactions": "/api/finance/transactions/",
                "credit_cards": "/api/finance/credit-cards/",
            },
        }
    )


class AccountListCreateView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer

    def get_queryset(self):
        return Account.objects.select_related("owner").filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountSerializer

    def get_queryset(self):
        return Account.objects.select_related("owner").filter(owner=self.request.user)


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.select_related("owner").filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.select_related("owner").filter(owner=self.request.user)


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.select_related("owner", "account", "category").filter(
            owner=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.select_related("owner", "account", "category").filter(
            owner=self.request.user
        )


class CreditCardListCreateView(generics.ListCreateAPIView):
    serializer_class = CreditCardSerializer

    def get_queryset(self):
        return CreditCard.objects.select_related("owner").filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CreditCardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CreditCardSerializer

    def get_queryset(self):
        return CreditCard.objects.select_related("owner").filter(owner=self.request.user)
