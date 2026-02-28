from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def root(request):
    return JsonResponse({"message": "Value In Motion API"})


urlpatterns = [
    path("", root),
    path("admin/", admin.site.urls),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/autenticacao/token/", TokenObtainPairView.as_view(), name="token_obtain_pair_pt"),
    path(
        "api/autenticacao/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh_pt",
    ),
    path("api/", include("apps.core.urls")),
    path("api/users/", include("apps.users.urls")),
    path("api/finance/", include("apps.finance.urls")),
    path("api/usuarios/", include("apps.users.urls")),
    path("api/financas/", include("apps.finance.urls")),
]
