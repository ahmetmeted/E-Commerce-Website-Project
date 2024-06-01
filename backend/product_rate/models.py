from django.db import models
from django.db import models
from django.contrib.auth.models import User
from product.models import Product


# Create your models here.
class ProductRate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.product} - {self.rating}"