from django.contrib import admin
from .models import Product

# Register your models here.

class ProductAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'product_price']
    search_fields = ['product_name', 'product_price']
    list_filter = ['product_name', 'product_price']
    
    

admin.site.register(Product, ProductAdmin)

