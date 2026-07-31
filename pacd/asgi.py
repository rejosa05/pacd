"""
I-replace ang content sa imong queuing_project/asgi.py niini.
(I-adjust ang 'queuing_project' ngadto sa tinuod nga ngalan sa imong project)
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pacd.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from app.routing import websocket_urlpatterns

# Kinahanglan i-init una ang Django ASGI app before mag-import og
# bisan unsa nga naga-touch sa models (sama sa consumers/routing)
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    'http': django_asgi_app,

    # AuthMiddlewareStack: gamiton ang session cookie (Django Auth) para
    # ma-identify kung kinsa ang naka-connect sa WebSocket
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})

