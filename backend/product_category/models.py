from django.db import models

# Create your models here.

class Product_Category(models.Model):
    category_name = models.CharField(max_length=100)
    category_description = models.TextField()
    # category_image = models.ImageField(upload_to='category_images/', blank=True, null=True)
    
    def __str__(self):
        return self.category_name
