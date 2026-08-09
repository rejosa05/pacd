from django.urls import re_path
from .consumers import UserManagementConsumer, QueueConsumer

websocket_urlpatterns = [
    re_path(r'ws/user-management/$', UserManagementConsumer.as_asgi()),
    re_path(r'ws/queue-display/$', QueueConsumer.as_asgi()),
]

#test