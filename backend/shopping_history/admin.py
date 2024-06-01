from django.contrib import admin
from .models import PurchaseHistory

class PurchaseHistoryAdmin(admin.ModelAdmin):
    list_display = ['owner', 'item_name', 'item_quantity', 'order_address', 'order_total_price', 'order_date']
    search_fields = ['item_name', 'order_address', 'owner__username']
    list_filter = ['order_date', 'owner']

admin.site.register(PurchaseHistory, PurchaseHistoryAdmin)
