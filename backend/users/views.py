from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import UserProfile
from .serializers import RegisterSerializer, UserProfileSerializer


@api_view(["GET"])
def users_overview(request):
    return Response(
        {
            "module": "users",
            "endpoints": {
                "register": "/api/users/register/",
                "profiles": "/api/users/profiles/",
            },
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        status=201,
    )


class UserProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return UserProfile.objects.select_related("user").filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return UserProfile.objects.select_related("user").filter(user=self.request.user)
