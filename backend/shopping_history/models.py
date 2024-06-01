from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

class PurchaseHistory(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchase_histories')
    item_name = models.CharField(max_length=255)
    item_quantity = models.CharField(max_length=255)  # Use ArrayField for storing list of integers
    order_address = models.CharField(max_length=255)
    order_total_price = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.owner.username} - {self.item_name} - {self.order_date}"
