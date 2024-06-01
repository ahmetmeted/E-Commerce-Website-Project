from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from store.models import Store

class StoreOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'is_active')

class StoreOwnerLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = StoreOwnerSerializer(self.user).data
        
        # Get the store associated with the user
        try:
            store = Store.objects.get(owner=self.user)
            data['store_id'] = store.id
        except Store.DoesNotExist:
            data['store_id'] = None
        
        for k, v in serializer.items():
            data[k] = v
        
        return data
    
    
class StoreOwnerChangeUserInformationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.save()
        return instance

    def create(self, validated_data):
        return User(**validated_data)
