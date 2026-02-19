from django.urls import path

from .views import UserProfileDetailView, UserProfileListCreateView, register_user, users_overview

urlpatterns = [
    path("", users_overview, name="users_overview"),
    path("register/", register_user, name="users_register"),
    path("profiles/", UserProfileListCreateView.as_view(), name="userprofile_list_create"),
    path("profiles/<int:pk>/", UserProfileDetailView.as_view(), name="userprofile_detail"),
]
