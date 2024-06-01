from django.contrib import admin
from .models import Store

# Register your models here.


class StoreAdmin(admin.ModelAdmin):
    list_display = ['store_name', 'store_address']
    search_fields = ['store_name', 'store_address']
    list_filter = ['store_name', 'store_address']
    

admin.site.register(Store, StoreAdmin)

