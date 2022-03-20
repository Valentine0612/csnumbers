from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/coinflip/', consumers.ItemConsumer.as_asgi()),
    path('ws/digit/', consumers.DigitsConsumers.as_asgi()),
]