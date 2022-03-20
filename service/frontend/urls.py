from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('coinflip/', index),
    path('shop/', index),
    path('help/', index),
    path('rules/', index),
    path('faq/', index),
    path('confidentiality/', index),
    
    path('console/', index),
    path('console/users/', index),
    path('console/outputs/', index),

    path('profile/', index),
    path('profile/inventory/', index),
    path('profile/transactions/', index),
    path('profile/outputs/', index),
]
