from rest_framework import viewsets
from .models import Store
from .serializers import StoreSerializer

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects
    serializer_class = StoreSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned stores to a given user and owner,
        by filtering against `user` and `owner` query parameters in the URL.
        """
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user', None)
        owner_id = self.request.query_params.get('owner', None)
        
        if user_id is not None:
            queryset = queryset.filter(user__id=user_id)
        if owner_id is not None:
            queryset = queryset.filter(owner__id=owner_id)
        
        return queryset
