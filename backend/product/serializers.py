from rest_framework import routers, serializers, viewsets
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'product_name', 'product_price', 'product_description', 'product_images', 'store_id')

    def create(self, validated_data):
        store_id = validated_data.pop('store_id', None)
        if store_id is None:
            raise serializers.ValidationError({"store_id": "This field is required."})
        product = Product.objects.create(store_id=store_id, **validated_data)
        return product