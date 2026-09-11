from django.urls import re_path
from .consumers import UserManagementConsumer, QueueConsumer, TransactionLogConsumer

websocket_urlpatterns = [
    re_path(r'ws/user-management/$', UserManagementConsumer.as_asgi()),
    re_path(r'ws/queue-display/$', QueueConsumer.as_asgi()),
    re_path(r"ws/transactions/$", TransactionLogConsumer.as_asgi()),
]

#test