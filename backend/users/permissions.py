from rest_framework import permissions

class IsRHOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée : Seuls les RH et DG peuvent modifier les données
    """
    def has_permission(self, request, view):
        # Lecture autorisée pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Modification autorisée seulement pour RH et DG
        return request.user.is_authenticated and request.user.is_rh

class IsOwnerOrRH(permissions.BasePermission):
    """
    Permission : L'utilisateur peut voir ses propres données, RH peut voir toutes
    """
    def has_object_permission(self, request, view, obj):
        # RH et DG peuvent voir toutes les données
        if request.user.is_rh:
            return True
        
        # L'utilisateur peut voir ses propres données
        return obj == request.user 