from django.contrib import admin

from .models import (
    Account,
    Budget,
    CardInstallment,
    CardPurchase,
    Category,
    CreditCard,
    Goal,
    Investment,
    Recurrence,
    Transaction,
)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "account_type", "owner", "created_at")
    search_fields = ("name", "owner__username", "owner__email")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "transaction_type", "owner", "created_at")
    list_filter = ("transaction_type",)
    search_fields = ("name", "owner__username", "owner__email")


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "transaction_type",
        "amount",
        "occurred_on",
        "owner",
        "account",
        "category",
    )
    list_filter = ("transaction_type", "occurred_on")
    search_fields = ("description", "owner__username", "account__name", "category__name")


@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "brand", "limit_amount", "closing_day", "due_day", "is_active", "owner")
    list_filter = ("is_active", "brand")
    search_fields = ("name", "brand", "owner__username", "owner__email")


@admin.register(CardPurchase)
class CardPurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "description", "credit_card", "total_amount", "installments_count", "purchase_date", "owner")
    list_filter = ("purchase_date", "credit_card")
    search_fields = ("description", "owner__username", "credit_card__name")


@admin.register(CardInstallment)
class CardInstallmentAdmin(admin.ModelAdmin):
    list_display = ("id", "purchase", "installment_number", "amount", "due_date", "status", "transaction")
    list_filter = ("status", "due_date")
    search_fields = ("purchase__description", "purchase__owner__username")


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "investment_type", "invested_amount", "current_amount", "contribution_date", "owner")
    list_filter = ("investment_type",)
    search_fields = ("name", "institution", "owner__username")


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "target_amount", "current_amount", "priority", "active", "owner")
    list_filter = ("priority", "active")
    search_fields = ("title", "owner__username")


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "month_ref", "limit_amount", "alert_percent", "active", "owner")
    list_filter = ("month_ref", "active")
    search_fields = ("category__name", "owner__username")


@admin.register(Recurrence)
class RecurrenceAdmin(admin.ModelAdmin):
    list_display = ("id", "description", "transaction_type", "source", "amount", "frequency", "active", "owner")
    list_filter = ("transaction_type", "source", "frequency", "active")
    search_fields = ("description", "owner__username")
