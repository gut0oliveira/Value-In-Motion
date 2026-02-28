from django.urls import path
from .api.views import api_overview, health_check

urlpatterns = [
    path("", api_overview, name="api_overview"),
    path("health/", health_check, name="health_check"),
]
