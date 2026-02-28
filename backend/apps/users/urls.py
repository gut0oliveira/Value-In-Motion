from django.urls import path

from .api.views import (
    UserProfileDetailView,
    UserProfileListCreateView,
    current_user,
    register_user,
    users_overview,
)

urlpatterns = [
    path("", users_overview, name="users_overview"),
    path("register/", register_user, name="users_register"),
    path("cadastro/", register_user, name="usuarios_cadastro"),
    path("me/", current_user, name="users_me"),
    path("eu/", current_user, name="usuarios_eu"),
    path("profiles/", UserProfileListCreateView.as_view(), name="userprofile_list_create"),
    path("perfis/", UserProfileListCreateView.as_view(), name="perfil_listar_criar"),
    path("profiles/<int:pk>/", UserProfileDetailView.as_view(), name="userprofile_detail"),
    path("perfis/<int:pk>/", UserProfileDetailView.as_view(), name="perfil_detalhe"),
]
