def remove_card_purchase_and_related_transactions(purchase):
    transactions = [item.transaction for item in purchase.installments.all() if item.transaction]
    purchase.delete()
    for trx in transactions:
        trx.delete()
