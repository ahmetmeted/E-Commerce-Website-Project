from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Store(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stores')
    store_name = models.CharField(max_length=100, help_text="Enter the name of the store.")
    store_address = models.CharField(max_length=100, help_text="Enter the address of the store.")
    
    # store_phone_number = models.CharField(max_length=100)
    # store_email = models.EmailField(max_length=100)
    # store_description = models.TextField()
    # store_category = models.CharField(max_length=100)
    # store_image = models.ImageField(upload_to='stores')

    def __str__(self):
        return self.store_name
