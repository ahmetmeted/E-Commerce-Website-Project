from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomerLoginSerializer, CustomerChangeUserInformationSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User, Group
from django.utils.decorators import method_decorator
from django.core.mail import EmailMessage
from django.conf import settings
from django.urls import reverse
from django.utils.html import mark_safe

from product.models import Product
from basket.models import Basket

from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework import serializers



class CustomerChangeUserInformationSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.CharField(required=False)



def is_customer(user):
    return user.groups.filter(name='customer').exists() if hasattr(user, 'groups') else False


@permission_classes((permissions.AllowAny,))
class CustomerLoginView(TokenObtainPairView):
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
    serializer_class = CustomerLoginSerializer
    
    
    
    

@permission_classes((permissions.AllowAny,))
class CustomerUserRegisterView(APIView):
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
      - 201:
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
          
          # Add user to 'customer' group
          customer_group = Group.objects.get(name='customer')
          user.groups.add(customer_group)
          user.save()
          
          return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

      except Exception as e:
          return Response({'error': f'Failed to register user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    

class CustomerChangePasswordApiView(APIView):
    """
    Change Password Informations
    ---
    parameters:
      - name: old_password
        in: formData
        type: string
        required: true
        description: The current password of the user.
      - name: new_password1
        in: formData
        type: string
        required: true
        description: The new password to be set.
      - name: new_password2
        in: formData
        type: string
        required: true
        description: Confirmation of the new password.
    ---
    responses:
      - 200:
        description: Password changed successfully.
      - 400:
        description: Invalid request. Check parameters.
    """
    permission_classes = [IsAuthenticated]
    @method_decorator(user_passes_test(is_customer))
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
            
                
    
    
class CustomerChangeInformationApiView(APIView):
    """
    Change User Information
    ---
    parameters:
    - name: username
        in: formData
        type: string
        required: true
        description: The new username of the user.
      - name: first_name
        in: formData
        type: string
        required: true
        description: The new first name of the user.
      - name: last_name
        in: formData
        type: string
        required: true
        description: The new last name of the user.
      - name: email
        in: formData
        type: string
        required: true
        description: The new email of the user.
    ---
    responses:
      - 200:
        description: User information changed successfully.
      - 400:
        description: Invalid request. Check parameters.
    """
    permission_classes = [IsAuthenticated]
    @method_decorator(user_passes_test(is_customer))
    def post(self, request):
        serializer = CustomerChangeUserInformationSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            for key, value in serializer.validated_data.items():
                setattr(user, key, value)  # Dynamically set the user attributes
            user.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
      
@permission_classes((permissions.AllowAny,))
class SendEmailApiView(APIView):
    """
    Send Email
    ---
    parameters:
      - name: email
        in: formData
        type: string
        required: true
        description: The email of the user.
      - name: name
        in: formData
        type: string
        required: true
        description: The name of the user.
      - name: message
        in: formData
        type: string
        required: true
        description: The message from the user.
    ---
    responses:
      - 200:
        description: Email sent successfully.
      - 400:
        description: Invalid request. Check parameters.
    """

    def post(self, request):
        data = request.data.copy()
        
        required_fields = ['email', 'name', 'message']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            self.send_email(data['email'], data['name'], data['message'])
            return Response({'message': 'Email sent successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
          
    def send_email(self, email, name, message_content):
        subject = f"Message from {name}"
        domain = 'http://localhost:8000'
        message = mark_safe(f"""<html>
                                <body>
                                    <p>You have received a new message from {name}:</p>
                                    <p>{message_content}</p>
                                </body>
                                </html>""")
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [email]
        email = EmailMessage(subject, message, email_from, recipient_list)
        email.content_subtype = "html"  # This is crucial to send the email as HTML
        email.send()


class CustomerForgetPasswordApiView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()
        
        required_fields = ['email']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=data['email'])
            reset_link = reverse("customer_reset_password", args=[user.id])
            self.send_email(data['email'], user.id)
            return Response({'message': 'Email sent successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
          
    def send_email(self, email, user_id):
        subject = "Password Reset Request"
        frontend_reset_link = f"http://localhost:3000/reset-password/{user_id}"  # Adjust the URL to match your frontend setup
        message = mark_safe(f"""<html>
                                <body>
                                    <p>Please follow the instructions to reset your password by clicking on the link below:</p>
                                    <a href="{frontend_reset_link}">Reset Password</a>
                                    <p>If you did not request a password reset, please ignore this email.</p>
                                </body>
                                </html>""")
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [email]
        email = EmailMessage(subject, message, email_from, recipient_list)
        email.content_subtype = "html"  # This is crucial to send the email as HTML
        email.send()


class CustomerAddProductToBasketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        # Retrieve quantity from request data
        quantity = request.data.get('quantity', 1)

        try:
            product = Product.objects.get(pk=product_id)

            # Optional: Check if the product belongs to the store of the authenticated user
            # if product.store.owner != request.user:
            #     return Response({'error': 'You do not have permission to add this product to basket'}, status=403)
            
            # Check if product is already in the basket
            basket_item, created = Basket.objects.get_or_create(
                product=product,
                user=request.user,
                defaults={'quantity': quantity}
            )

            if not created:
                # Update quantity if the product is already in the basket
                basket_item.quantity += int(quantity)
                basket_item.save()

            return HttpResponse('Product added to basket successfully', status=200)

        except Product.DoesNotExist:
            return HttpResponse("Product not found.", status=404)
      
      
class CustomerRemoveProductFromBasketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        try:
            # Retrieve the basket item with the given product_id for the logged-in user
            basket_item = Basket.objects.get(product_id=product_id, user=request.user)
            # Delete the basket item
            basket_item.delete()
            return HttpResponse("Product removed from basket successfully", status=200)
        except Basket.DoesNotExist:
            return HttpResponse("Product not found in basket.", status=404)
        
class CustomerDecreaseProductInBasketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        try:
            # Retrieve the basket item with the given product_id for the logged-in user
            basket_item = Basket.objects.get(product_id=product_id, user=request.user)
            
            # Check if the quantity is greater than 1
            if basket_item.quantity > 1:
                # Decrease the quantity by one
                basket_item.quantity -= 1
                basket_item.save()
                return HttpResponse("Product quantity decreased by one successfully", status=200)
            else:
                # If quantity is 1, remove the item from the basket entirely
                basket_item.delete()
                return HttpResponse("Product removed from basket as the quantity was one", status=200)

        except Basket.DoesNotExist:
            return HttpResponse("Product not found in basket.", status=404)
        
        
    
class CustomerClearBasketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Retrieve all basket items for the logged-in user
        basket_items = Basket.objects.filter(user=request.user)
        
        # Check if the basket is already empty
        if not basket_items.exists():
            return HttpResponse("Basket is already empty.", status=200)
        
        # Delete all items from the basket
        basket_items.delete()
        return HttpResponse("All products removed from basket successfully", status=200)
    
    
class GetUserInformationApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = {
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
        return Response(user_data, status=status.HTTP_200_OK)
    
class CustomerResetPasswordApiView(APIView):
    """
    Reset Password
    ---
    parameters:
      - name: new_password1
        in: formData
        type: string
        required: true
        description: The new password to be set.
      - name: new_password2
        in: formData
        type: string
        required: true
        description: Confirmation of the new password.
    ---
    responses:
      - 200:
        description: Password reset successfully.
      - 400:
        description: Invalid request. Check parameters.
    """
    permission_classes = [AllowAny]

    def post(self, request, user_id):
        data = request.data.copy()
        
        required_fields = ['new_password1', 'new_password2']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)
        
        if data['new_password1'] != data['new_password2']:
            return Response({'message': 'New passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            user.set_password(data['new_password1'])
            user.save()
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to reset password: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)