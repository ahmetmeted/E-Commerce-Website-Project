from rest_framework import routers, serializers, viewsets
from .models import Basket

class BasketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Basket
        fields = ('id', 'product', 'quantity', 'user')