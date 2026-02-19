from django.urls import path

from .views import UserProfileDetailView, UserProfileListCreateView, users_overview

urlpatterns = [
    path("", users_overview, name="users_overview"),
    path("profiles/", UserProfileListCreateView.as_view(), name="userprofile_list_create"),
    path("profiles/<int:pk>/", UserProfileDetailView.as_view(), name="userprofile_detail"),
]
