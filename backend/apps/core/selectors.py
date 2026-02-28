from django.utils import timezone


def get_api_overview_payload():
    return {
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


def get_health_payload():
    return {
        "status": "ok",
        "service": "vimo-backend",
        "timestamp": timezone.now().isoformat(),
    }
