from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone


@api_view(["GET"])
@permission_classes([AllowAny])
def api_overview(request):
    return Response(
        {
            "name": "Vimo API",
            "status": "running",
            "endpoints": {
                "health": "/api/health/",
                "auth_token": "/api/auth/token/",
                "auth_refresh": "/api/auth/token/refresh/",
                "token_autenticacao": "/api/autenticacao/token/",
                "token_refresh_autenticacao": "/api/autenticacao/token/refresh/",
                "users": "/api/users/",
                "usuarios": "/api/usuarios/",
                "finance": "/api/finance/",
                "financas": "/api/financas/",
            },
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response(
        {
            "status": "ok",
            "service": "vimo-backend",
            "timestamp": timezone.now().isoformat(),
        }
    )
