from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Preflight, ChecklistItem
from .serializers import PreflightSerializer, ChecklistItemSerializer


# LIST + CREATE + SEARCH
class PreflightListCreate(generics.ListCreateAPIView):
    serializer_class = PreflightSerializer

    def get_queryset(self):
        q = self.request.query_params.get("q")
        qs = Preflight.objects.all().order_by("flight_number")

        if q:
            qs = qs.filter(flight_number__icontains=q)

        return qs


# RETRIEVE + UPDATE + DELETE
class PreflightRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Preflight.objects.all()
    serializer_class = PreflightSerializer
    lookup_field = "flight_number"  # IMPORTANT


# ADD ITEM TO PREFLIGHT
@api_view(['POST'])
def add_item_to_preflight(request, flight_number):
    preflight = get_object_or_404(Preflight, flight_number=flight_number)

    data = request.data.copy()
    data["preflight"] = preflight.flight_number

    serializer = ChecklistItemSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# SINGLE ITEM EDIT + DELETE
class ChecklistItemRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer
