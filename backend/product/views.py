# Install Django REST Framework filters if not already installed
# pip install django-filter

from rest_framework import viewsets, filters
from .models import Product
from .serializers import ProductSerializer
from rest_framework.response import Response
from rest_framework import permissions, status
from django.http import JsonResponse
from django.db.models import Q


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['product_name', 'product_description']

    def get_queryset(self):
        queryset = self.queryset
        store_id = self.request.query_params.get('store_id', None)
        if store_id is not None:
            queryset = queryset.filter(store_id=store_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(store_id=self.request.data.get('store_id'))
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
def product_search(request):
    query = request.GET.get('query', '')
    store_id = request.GET.get('store_id', None)
    products = Product.objects.filter(
        Q(product_name__icontains=query) | Q(product_description__icontains=query)
    )
    if store_id:
        products = products.filter(store_id=store_id)
    product_list = list(products.values())
    return JsonResponse(product_list, safe=False)
