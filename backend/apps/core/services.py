from .selectors import get_api_overview_payload, get_health_payload


def build_api_overview():
    return get_api_overview_payload()


def build_health_status():
    return get_health_payload()
