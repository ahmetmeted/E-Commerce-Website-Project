from django.contrib import admin
from .models import Basket

# Register your models here.

class BasketAdmin(admin.ModelAdmin):
    list_display = ['product', 'quantity', 'user']
    search_fields = ['product', 'quantity', 'user']
    list_filter = ['product', 'quantity', 'user']
    
    
admin.site.register(Basket, BasketAdmin)
