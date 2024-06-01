from rest_framework import viewsets
from .models import Basket
from .serializers import BasketSerializer
from rest_framework.views import APIView
from django.utils.html import mark_safe
from django.conf import settings
from django.core.mail import EmailMessage
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.permissions import IsAuthenticated


class BasketViewSet(viewsets.ModelViewSet):
    queryset = Basket.objects
    serializer_class = BasketSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `user` query parameter in the URL.
        """
        queryset = self.queryset
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            queryset = queryset.filter(user__id=user_id)
        return queryset


class SendEmailOrderDetails(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()

        # Check for all required fields
        required_fields = ['email', 'item_name', 'item_quantity', 'order_address', 'order_total_price']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Construct the email message with the new details
            self.send_email(
                email=data['email'],
                item_name=data['item_name'],
                item_quantity=data['item_quantity'],
                order_address=data['order_address'],
                order_total_price=data['order_total_price']
            )
            return Response({'message': 'Email sent successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def send_email(self, email, item_name, item_quantity, order_address, order_total_price):
        subject = "Your Order Details"
        message = mark_safe(f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); background-color: #f9f9f9;">
                    <h1 style="color: #4CAF50; text-align: center;">Thank you for your order!</h1>
                    <p style="font-size: 18px; text-align: center;">Here are the details of your purchase:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f2f2f2;">Item Name</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f2f2f2;">Quantity</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 12px;">{item_name}</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">{item_quantity}</td>
                        </tr>
                    </table>
                    <p style="font-size: 18px; margin-top: 20px;">Shipping to: <strong>{order_address}</strong></p>
                    <p style="font-size: 18px;">Total Price: <strong>${order_total_price}</strong></p>
                    <p style="font-size: 18px; margin-top: 20px; text-align: center;">We appreciate your business and hope you enjoy your purchase!</p>
                    <p style="text-align: center; color: #888; font-size: 14px; margin-top: 30px;">&copy; All rights reserved.</p>
                </div>
            </body>
            </html>
        """)
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [email]
        email_message = EmailMessage(subject, message, email_from, recipient_list)
        email_message.content_subtype = "html"  # This is crucial to send the email as HTML
        email_message.send()
