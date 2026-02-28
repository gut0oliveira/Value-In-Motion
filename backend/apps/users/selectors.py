from .models import UserProfile


def get_users_overview_payload():
    return {
        "module": "users",
        "endpoints": {
            "register": "/api/users/register/",
            "profiles": "/api/users/profiles/",
            "me": "/api/users/me/",
        },
    }


def get_current_user_payload(user):
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "email": user.email,
    }


def get_user_profiles_queryset(user):
    return UserProfile.objects.select_related("user").filter(user=user)
