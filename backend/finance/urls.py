from django.urls import path

from .views import (
    AccountDetailView,
    AccountListCreateView,
    CategoryDetailView,
    CategoryListCreateView,
    TransactionDetailView,
    TransactionListCreateView,
    finance_overview,
)

urlpatterns = [
    path("", finance_overview, name="finance_overview"),
    path("accounts/", AccountListCreateView.as_view(), name="account_list_create"),
    path("accounts/<int:pk>/", AccountDetailView.as_view(), name="account_detail"),
    path("categories/", CategoryListCreateView.as_view(), name="category_list_create"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category_detail"),
    path(
        "transactions/",
        TransactionListCreateView.as_view(),
        name="transaction_list_create",
    ),
    path(
        "transactions/<int:pk>/",
        TransactionDetailView.as_view(),
        name="transaction_detail",
    ),
]
