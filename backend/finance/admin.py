from django.contrib import admin

from .models import Account, Category, Transaction


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
