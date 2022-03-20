"""
ASGI config for service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os
import backend.routing

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django_channels_jwt_auth_middleware.auth import JWTAuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "service.settings")

application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            backend.routing.websocket_urlpatterns
        )
    ),
})