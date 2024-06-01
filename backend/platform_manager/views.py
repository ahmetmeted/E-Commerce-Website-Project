from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    PlatformManagerChangeUserInformationSerializer,
    PlatformManagerLoginSerializer,
)

from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User, Group
from django.utils.decorators import method_decorator



def is_platformmanager(user):
    return user.groups.filter(name='platform_manager').exists() if hasattr(user, 'groups') else False

@permission_classes((permissions.AllowAny,))
class PlatformManagerLoginView(TokenObtainPairView):
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
    """
    serializer_class = PlatformManagerLoginSerializer
    

@permission_classes((permissions.AllowAny,))
class PlatformManagerUserRegisterView(APIView):
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

      # Ensure required fields are present
      required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
      for field in required_fields:
          if field not in data:
              return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)

      try:
          # Create a new user
          user = User.objects.create_user(username=data['username'],
                                          email=data['email'],
                                          password=data['password'],
                                          first_name=data['first_name'],
                                          last_name=data['last_name'])
          
          # Add user to 'platform_manager' group
          platform_manager_group = Group.objects.get(name='platform_manager')
          user.groups.add(platform_manager_group)
          user.save()
          
          return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

      except Exception as e:
          return Response({'error': f'Failed to register user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    
class PlatformManagerChangePasswordView(APIView):
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
    @method_decorator(user_passes_test(is_platformmanager))
    def post(self, request):
        data = request.data.copy()
        user = request.user  # Accessing user directly from request
        if user.check_password(data['old_password']):
            if data['new_password1'] == data['new_password2']:
                user.set_password(data['new_password1'])
                user.save()
                update_session_auth_hash(request, user)
                return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
            return Response({'message': 'New Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
    
    
class PlatformManagerChangeUserInformationView(APIView):
    """
    User Change Information Informations
    ---
    parameters:
    - name: username
        in: formData
        type: string
        required: true
        description: The username of the user.
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
    serializer_class = PlatformManagerChangeUserInformationSerializer
    permission_classes = (IsAuthenticated,)
    
    @method_decorator(user_passes_test(is_platformmanager))
    def post(self, request):
        serializer = PlatformManagerChangeUserInformationSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.email = serializer.data.get('email')
            user.username = serializer.data.get('username')
            user.first_name = serializer.data.get('first_name')
            user.last_name = serializer.data.get('last_name')
            user.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)