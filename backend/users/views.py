from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import UserProfile
from .serializers import UserProfileSerializer


@api_view(["GET"])
def users_overview(request):
    return Response(
        {
            "module": "users",
            "endpoints": {
                "profiles": "/api/users/profiles/",
            },
        }
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
