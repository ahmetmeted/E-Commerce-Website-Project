from django.contrib import admin
from .models import Product_Category

# Register your models here.


class Product_CategoryAdmin(admin.ModelAdmin):
    list_display = ['category_name']
    search_fields = ['category_name']
    list_filter = ['category_name']
    
    
admin.site.register(Product_Category, Product_CategoryAdmin)
