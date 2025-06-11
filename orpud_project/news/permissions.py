from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Разрешение, которое позволяет админам выполнять любые действия,
    а остальным пользователям только безопасные методы (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        # Разрешаем безопасные методы всем
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Разрешаем остальные методы только админам
        return request.user and request.user.is_staff
    

class OwnerOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        return (
                request.method in permissions.SAFE_METHODS
                or request.user.is_authenticated
            )

    def has_object_permission(self, request, view, obj):
        return obj.author == request.user
    

class ReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS