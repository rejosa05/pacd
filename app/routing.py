from django.urls import path
from .consumers import QueueConsumer

websocket_urlpatterns = [
    path('ws/queue/', QueueConsumer.as_asgi()),
]