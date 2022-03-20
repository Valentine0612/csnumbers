from rest_framework.permissions import BasePermission

class IsBanned(BasePermission):
    """
    Allows access not banned users.
    """

    def has_permission(self, request, view):
        return bool(request.user and not request.user.is_banned)


class IsConfirmed(BasePermission):
    """
    Allows access confirmed users.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_email_confirmed)