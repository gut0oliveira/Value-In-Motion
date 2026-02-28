from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..selectors import (
    get_accounts_queryset,
    get_budgets_queryset,
    get_card_purchases_queryset,
    get_categories_queryset,
    get_credit_cards_queryset,
    get_finance_overview_payload,
    get_goals_queryset,
    get_investments_queryset,
    get_recurrences_queryset,
    get_transactions_queryset,
)
from ..serializers import (
    AccountSerializer,
    BudgetSerializer,
    CardPurchaseSerializer,
    CategorySerializer,
    CreditCardSerializer,
    GoalSerializer,
    InvestmentSerializer,
    RecurrenceSerializer,
    TransactionSerializer,
)
from ..services import remove_card_purchase_and_related_transactions


@api_view(["GET"])
def finance_overview(request):
    return Response(get_finance_overview_payload())


class AccountListCreateView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer

    def get_queryset(self):
        return get_accounts_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountSerializer

    def get_queryset(self):
        return get_accounts_queryset(self.request.user)


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return get_categories_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return get_categories_queryset(self.request.user)


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return get_transactions_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return get_transactions_queryset(self.request.user)


class CreditCardListCreateView(generics.ListCreateAPIView):
    serializer_class = CreditCardSerializer

    def get_queryset(self):
        return get_credit_cards_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CreditCardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CreditCardSerializer

    def get_queryset(self):
        return get_credit_cards_queryset(self.request.user)


class CardPurchaseListCreateView(generics.ListCreateAPIView):
    serializer_class = CardPurchaseSerializer

    def get_queryset(self):
        return get_card_purchases_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CardPurchaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CardPurchaseSerializer

    def get_queryset(self):
        return get_card_purchases_queryset(self.request.user)

    def perform_destroy(self, instance):
        remove_card_purchase_and_related_transactions(instance)


class InvestmentListCreateView(generics.ListCreateAPIView):
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        return get_investments_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class InvestmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        return get_investments_queryset(self.request.user)


class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        return get_goals_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        return get_goals_queryset(self.request.user)


class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return get_budgets_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return get_budgets_queryset(self.request.user)


class RecurrenceListCreateView(generics.ListCreateAPIView):
    serializer_class = RecurrenceSerializer

    def get_queryset(self):
        return get_recurrences_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class RecurrenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecurrenceSerializer

    def get_queryset(self):
        return get_recurrences_queryset(self.request.user)
