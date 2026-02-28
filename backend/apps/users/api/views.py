from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..selectors import (
    get_current_user_payload,
    get_user_profiles_queryset,
    get_users_overview_payload,
)
from ..serializers import UserProfileSerializer
from ..services import get_register_response_payload, register_new_user


@api_view(["GET"])
def users_overview(request):
    return Response(get_users_overview_payload())


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    user = register_new_user(request.data)
    return Response(get_register_response_payload(user), status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response(get_current_user_payload(request.user))


class UserProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return get_user_profiles_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return get_user_profiles_queryset(self.request.user)
