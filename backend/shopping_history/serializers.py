from rest_framework import serializers
from .models import PurchaseHistory

class PurchaseHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseHistory
        fields = ['id', 'owner', 'item_name', 'item_quantity', 'order_address', 'order_total_price', 'order_date']
