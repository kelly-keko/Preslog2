from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Ajout des champs personnalisés (role et biometric_id)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Informations SECEL", {"fields": ("role", "biometric_id",)}),
    )
    list_display = BaseUserAdmin.list_display + ("role", "biometric_id",)
    search_fields = BaseUserAdmin.search_fields + ("biometric_id",)
    list_filter = BaseUserAdmin.list_filter + ("role",)
    # On garde is_active dans le fieldset d'origine pour éviter les doublons 