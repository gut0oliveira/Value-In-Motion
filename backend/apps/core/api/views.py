from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..services import build_api_overview, build_health_status


@api_view(["GET"])
@permission_classes([AllowAny])
def api_overview(request):
    return Response(build_api_overview())


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response(build_health_status())
