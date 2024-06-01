from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import StoreOwnerChangeUserInformationSerializer, StoreOwnerLoginSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User, Group, Permission
from django.utils.decorators import method_decorator
from rest_framework import viewsets
from .serializers import StoreOwnerSerializer
from store.models import Store

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({'user': self.user.username})  # Add the user information to the response data
        return data



def is_store_owner(user):
    return user.groups.filter(name='store_owner').exists() if hasattr(user, 'groups') else False

@permission_classes((permissions.AllowAny,))
class StoreOwnerLoginView(TokenObtainPairView):
    """
    User Login Informations
    ---
    parameters:
    - name: username
      in: formData
      type: string
      required: true
      description: The username of the user.
    - name: password
      in: formData
      type: string
      required: true
      description: The password of the user.
    ---
    responses:
    - 200:
      description: User logged in successfully.
    - 400:
      description: Invalid request. Check parameters.
    - 403:
      description: User does not belong to the 'store_owner' group.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.get(username=serializer.validated_data['user'])
        if not user.groups.filter(name='store_owner').exists():
            return Response({'error': 'User does not belong to the store_owner group.'}, status=status.HTTP_403_FORBIDDEN)

        # Assuming there is a related Store model with a ForeignKey to User
        store = Store.objects.get(owner=user)  # Adjust this line according to your actual model

        user_data = serializer.validated_data
        user_data['store_id'] = store.id  # Add the store id to the response data

        return Response(user_data, status=status.HTTP_200_OK)
    
    
    
@permission_classes((permissions.AllowAny,))
class StoreOwnerUserRegisterView(APIView):
    """
    User Register Informations
    ---
    parameters:
     - name: email
        in: formData
        type: string
        required: true
        description: The email of the user.
    - name: username
        in: formData
        type: string
        required: true
        description: The username of the user.
    - name: first_name
        in: formData
        type: string
        required: true
        description: The first name of the user.
    - name: last_name
        in: formData
        type: string
        required: true
        description: The last name of the user.
    - name: password
        in: formData
        type: string
        required: true
        description: The password of the user.
    ---
    responses:
    - 200:
        description: User registered successfully.
    - 400:
        description: Invalid request. Check parameters.
    """
    def post(self, request):
        data = request.data.copy()

        required_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'store_name', 'store_address']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )

            store_owner_group = Group.objects.get(name='store_owner')
            store_owner_permissions = Permission.objects.filter(
                name__in=[
                    'Can view store owner',
                    'Can change store owner',
                    'Can delete store owner',
                    'Can add store owner',
                    'Can add product',
                    'Can change product',
                    'Can delete product',
                    'Can view product',
                ]
            )

            user.user_permissions.add(*store_owner_permissions)
            user.groups.add(store_owner_group)
            user.save()

            store = Store.objects.create(
                owner=user,
                store_name=data['store_name'],
                store_address=data['store_address']
            )

            return Response({'message': 'User and store created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Failed to create user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class StoreOwnerChangePasswordView(APIView):
    """
    User Change Password Informations
    ---
    parameters:
      - name: old_password
        in: formData
        type: string
        required: true
        description: The old password of the user.
     - name: new_password1
        in: formData
        type: string
        required: true
        description: The new password of the user.
    - name: new_password2
        in: formData
        type: string
        required: true
        description: The new password of the user.
    ---
    responses:
    - 200:
        description: User password changed successfully.
    - 400:
        description: Invalid request. Check parameters.
    """
    permission_classes = (IsAuthenticated,)
    @method_decorator(user_passes_test(is_store_owner))
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        
        required_fields = ['old_password', 'new_password1', 'new_password2']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user  # Accessing user directly from request
        if user.check_password(data['old_password']):
            if data['new_password1'] == data['new_password2']:
                user.set_password(data['new_password1'])
                user.save()
                update_session_auth_hash(request, user)
                return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
            return Response({'message': 'New Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
            
          
class StoreOwnerChangeUserInformationView(APIView):
    """
    User Change Information Informations
    ---
    parameters:
      - name: email
        in: formData
        type: string
        required: true
        description: The email of the user.
     - name: username
        in: formData
        type: string
        required: true
        description: The username of the user.
    - name: first_name
        in: formData
        type: string
        required: true
        description: The first name of the user.
    - name: last_name
        in: formData
        type: string
        required: true
        description: The last name of the user.
    ---
    responses:
    - 200:
        description: User information changed successfully.
    - 400:
        description: Invalid request. Check parameters.
    """
    permission_classes = (IsAuthenticated,)

    @method_decorator(user_passes_test(is_store_owner))
    def post(self, request):
        serializer = StoreOwnerChangeUserInformationSerializer(data=request.data)
        if serializer.is_valid():
            request.user.email = request.data['email']
            request.user.username = request.data['username']
            request.user.first_name = request.data['first_name']
            request.user.last_name = request.data['last_name']
            request.user.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class StoreOwnerViewSet(viewsets.ModelViewSet):
    queryset = User.objects
    serializer_class = StoreOwnerSerializer
    










