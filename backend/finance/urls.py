from django.urls import path

from .views import (
    AccountDetailView,
    AccountListCreateView,
    CardPurchaseDetailView,
    CardPurchaseListCreateView,
    CategoryDetailView,
    CategoryListCreateView,
    CreditCardDetailView,
    CreditCardListCreateView,
    TransactionDetailView,
    TransactionListCreateView,
    finance_overview,
)

urlpatterns = [
    path("", finance_overview, name="finance_overview"),
    path("accounts/", AccountListCreateView.as_view(), name="account_list_create"),
    path("contas/", AccountListCreateView.as_view(), name="conta_listar_criar"),
    path("accounts/<int:pk>/", AccountDetailView.as_view(), name="account_detail"),
    path("contas/<int:pk>/", AccountDetailView.as_view(), name="conta_detalhe"),
    path("categories/", CategoryListCreateView.as_view(), name="category_list_create"),
    path("categorias/", CategoryListCreateView.as_view(), name="categoria_listar_criar"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category_detail"),
    path("categorias/<int:pk>/", CategoryDetailView.as_view(), name="categoria_detalhe"),
    path(
        "transactions/",
        TransactionListCreateView.as_view(),
        name="transaction_list_create",
    ),
    path(
        "transacoes/",
        TransactionListCreateView.as_view(),
        name="transacao_listar_criar",
    ),
    path(
        "transactions/<int:pk>/",
        TransactionDetailView.as_view(),
        name="transaction_detail",
    ),
    path(
        "transacoes/<int:pk>/",
        TransactionDetailView.as_view(),
        name="transacao_detalhe",
    ),
    path("credit-cards/", CreditCardListCreateView.as_view(), name="credit_card_list_create"),
    path("cartoes/", CreditCardListCreateView.as_view(), name="cartao_listar_criar"),
    path("credit-cards/<int:pk>/", CreditCardDetailView.as_view(), name="credit_card_detail"),
    path("cartoes/<int:pk>/", CreditCardDetailView.as_view(), name="cartao_detalhe"),
    path("card-purchases/", CardPurchaseListCreateView.as_view(), name="card_purchase_list_create"),
    path("parcelamentos/", CardPurchaseListCreateView.as_view(), name="parcelamento_listar_criar"),
    path("card-purchases/<int:pk>/", CardPurchaseDetailView.as_view(), name="card_purchase_detail"),
    path("parcelamentos/<int:pk>/", CardPurchaseDetailView.as_view(), name="parcelamento_detalhe"),
]
