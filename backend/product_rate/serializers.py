from rest_framework import serializers
from .models import ProductRate

class ProductRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRate
        fields = '__all__'
