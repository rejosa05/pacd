import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import app.routing  # <-- IMPORTANT (imong app name)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PACD_Project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # para normal Django
    "websocket": AuthMiddlewareStack(
        URLRouter(
            app.routing.websocket_urlpatterns
        )
    ),
})