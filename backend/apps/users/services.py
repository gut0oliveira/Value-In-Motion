from .serializers import RegisterSerializer


def register_new_user(payload):
    serializer = RegisterSerializer(data=payload)
    serializer.is_valid(raise_exception=True)
    return serializer.save()


def get_register_response_payload(user):
    return {
        "id": user.id,
        "first_name": user.first_name,
        "username": user.username,
        "last_name": user.last_name,
        "email": user.email,
    }
