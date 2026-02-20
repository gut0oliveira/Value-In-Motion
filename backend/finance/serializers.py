from rest_framework import serializers

from .models import Account, Category, CreditCard, Transaction


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ("id", "name", "account_type", "owner", "created_at", "updated_at")
        read_only_fields = ("id", "owner", "created_at", "updated_at")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "transaction_type",
            "owner",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "created_at", "updated_at")


class TransactionSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        account = attrs.get("account")
        category = attrs.get("category")
        transaction_type = attrs.get("transaction_type")

        if user and account and account.owner_id != user.id:
            raise serializers.ValidationError(
                {"account": "Conta nao pertence ao usuario autenticado."}
            )

        if user and category and category.owner_id != user.id:
            raise serializers.ValidationError(
                {"category": "Categoria nao pertence ao usuario autenticado."}
            )

        if category and transaction_type and category.transaction_type != transaction_type:
            raise serializers.ValidationError(
                {"transaction_type": "Tipo da transacao deve ser igual ao da categoria."}
            )

        return attrs

    class Meta:
        model = Transaction
        fields = (
            "id",
            "owner",
            "account",
            "category",
            "transaction_type",
            "description",
            "amount",
            "occurred_on",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "created_at", "updated_at")


class CreditCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = (
            "id",
            "name",
            "brand",
            "limit_amount",
            "closing_day",
            "due_day",
            "is_active",
            "owner",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "created_at", "updated_at")
