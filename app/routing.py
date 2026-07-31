from django.urls import re_path
from .consumers import UserManagementConsumer

websocket_urlpatterns = [
    re_path(r'ws/user-management/$', UserManagementConsumer.as_asgi())
]