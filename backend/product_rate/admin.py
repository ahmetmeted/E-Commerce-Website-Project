from django.contrib import admin
from .models import ProductRate

# Register your models here.


class ProductRateAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'rating']
    search_fields = ['user__username', 'product__name']
    list_filter = ['rating']
    
admin.site.register(ProductRate, ProductRateAdmin)