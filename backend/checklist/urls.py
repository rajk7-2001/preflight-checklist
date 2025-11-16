from django.urls import path
from . import views

urlpatterns = [
    path('preflights/', views.PreflightListCreate.as_view()),
    path('preflights/<str:flight_number>/', views.PreflightRetrieveUpdateDelete.as_view()),
    path('preflights/<str:flight_number>/items/', views.add_item_to_preflight),

    path('items/<int:pk>/', views.ChecklistItemRetrieveUpdateDelete.as_view()),
]
