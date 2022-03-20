from backend.serializers import UserSerializer
from .settings import JWT_AUTH


def my_jwt_response_handler(token, user=None, request=None):
    return {
        'token': token,
        'expires_in': JWT_AUTH['JWT_EXPIRATION_DELTA'],
        'user': UserSerializer(user, context={'request': request}).data
    }
