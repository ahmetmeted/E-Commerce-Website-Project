from django.shortcuts import render
from rest_framework import viewsets
from .models import PurchaseHistory
from .serializers import PurchaseHistorySerializer

from rest_framework.permissions import IsAuthenticated

class PurchaseHistoryViewSet(viewsets.ModelViewSet):
    queryset = PurchaseHistory.objects
    serializer_class = PurchaseHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        owner = self.request.query_params.get('owner', None)
        if owner is not None:
            queryset = queryset.filter(owner=owner)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
