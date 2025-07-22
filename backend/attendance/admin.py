from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Presence, Retard, Absence, BiometricLog

@admin.register(Presence)
class PresenceAdmin(admin.ModelAdmin):
    """Admin pour la gestion des présences"""
    list_display = [
        'employee_name', 'date', 'time_in_display', 'time_out_display', 
        'is_late', 'delay_minutes', 'status', 'total_hours'
    ]
    list_filter = [
        'date', 'is_late', 'employee__role', 'employee__is_active'
    ]
    search_fields = [
        'employee__first_name', 'employee__last_name', 'employee__email'
    ]
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
    
    readonly_fields = ['is_late', 'delay_minutes', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informations employé', {
            'fields': ('employee',)
        }),
        ('Pointage', {
            'fields': ('date', 'time_in', 'time_out')
        }),
        ('Calculs automatiques', {
            'fields': ('is_late', 'delay_minutes'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def employee_name(self, obj):
        """Nom complet de l'employé avec lien"""
        if obj.employee:
            url = reverse('admin:users_user_change', args=[obj.employee.id])
            return format_html('<a href="{}">{}</a>', url, obj.employee.get_full_name())
        return '-'
    employee_name.short_description = 'Employé'
    employee_name.admin_order_field = 'employee__first_name'
    
    def time_in_display(self, obj):
        """Affichage de l'heure d'entrée"""
        if obj.time_in:
            color = 'red' if obj.is_late else 'green'
            return format_html('<span style="color: {};">{}</span>', 
                             color, obj.time_in.strftime('%H:%M'))
        return '-'
    time_in_display.short_description = 'Heure entrée'
    
    def time_out_display(self, obj):
        """Affichage de l'heure de sortie"""
        if obj.time_out:
            return obj.time_out.strftime('%H:%M')
        return '-'
    time_out_display.short_description = 'Heure sortie'
    
    def status(self, obj):
        """Statut de la présence"""
        if not obj.time_in:
            return format_html('<span style="color: red;">ABSENT</span>')
        elif not obj.time_out:
            return format_html('<span style="color: orange;">EN COURS</span>')
        else:
            return format_html('<span style="color: green;">TERMINÉ</span>')
    status.short_description = 'Statut'
    
    def total_hours(self, obj):
        """Total des heures travaillées"""
        if obj.time_in and obj.time_out:
            from datetime import datetime
            start = datetime.combine(obj.date, obj.time_in)
            end = datetime.combine(obj.date, obj.time_out)
            diff = end - start
            hours = diff.total_seconds() / 3600
            return f"{hours:.2f}h"
        return '-'
    total_hours.short_description = 'Total heures'

@admin.register(Retard)
class RetardAdmin(admin.ModelAdmin):
    """Admin pour la gestion des retards"""
    list_display = [
        'employee_name', 'date', 'expected_time', 'actual_time', 
        'delay_minutes', 'justification_status', 'justified_at', 'validated_by_name'
    ]
    list_filter = [
        'date', 'justification_status', 'employee__role', 'employee__is_active'
    ]
    search_fields = [
        'employee__first_name', 'employee__last_name', 'employee__email',
        'justification'
    ]
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
    
    readonly_fields = [
        'employee', 'presence', 'date', 'expected_time', 'actual_time', 
        'delay_minutes', 'justified_at', 'validated_by', 'validated_at',
        'created_at', 'updated_at'
    ]
    
    actions = ['approve_justifications', 'reject_justifications']
    
    fieldsets = (
        ('Informations employé', {
            'fields': ('employee', 'presence')
        }),
        ('Détails du retard', {
            'fields': ('date', 'expected_time', 'actual_time', 'delay_minutes')
        }),
        ('Justification', {
            'fields': ('justification', 'justification_status', 'justified_at')
        }),
        ('Validation RH', {
            'fields': ('validated_by', 'validated_at'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def employee_name(self, obj):
        """Nom complet de l'employé avec lien"""
        if obj.employee:
            url = reverse('admin:users_user_change', args=[obj.employee.id])
            return format_html('<a href="{}">{}</a>', url, obj.employee.get_full_name())
        return '-'
    employee_name.short_description = 'Employé'
    
    def validated_by_name(self, obj):
        """Nom du validateur"""
        if obj.validated_by:
            return obj.validated_by.get_full_name()
        return '-'
    validated_by_name.short_description = 'Validé par'
    
    def approve_justifications(self, request, queryset):
        """Approuver les justifications sélectionnées"""
        from django.utils import timezone
        updated = queryset.update(
            justification_status='APPROUVEE',
            validated_by=request.user,
            validated_at=timezone.now()
        )
        self.message_user(request, f'{updated} justifications approuvées.')
    approve_justifications.short_description = 'Approuver les justifications sélectionnées'
    
    def reject_justifications(self, request, queryset):
        """Refuser les justifications sélectionnées"""
        from django.utils import timezone
        updated = queryset.update(
            justification_status='REFUSEE',
            validated_by=request.user,
            validated_at=timezone.now()
        )
        self.message_user(request, f'{updated} justifications refusées.')
    reject_justifications.short_description = 'Refuser les justifications sélectionnées'

@admin.register(Absence)
class AbsenceAdmin(admin.ModelAdmin):
    """Admin pour la gestion des absences"""
    list_display = [
        'employee_name', 'date', 'justification_status', 
        'justified_at', 'validated_by_name'
    ]
    list_filter = [
        'date', 'justification_status', 'employee__role', 'employee__is_active'
    ]
    search_fields = [
        'employee__first_name', 'employee__last_name', 'employee__email',
        'justification'
    ]
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
    
    readonly_fields = [
        'employee', 'date', 'justified_at', 'validated_by', 'validated_at',
        'created_at', 'updated_at'
    ]
    
    actions = ['approve_justifications', 'reject_justifications']
    
    fieldsets = (
        ('Informations employé', {
            'fields': ('employee',)
        }),
        ('Absence', {
            'fields': ('date',)
        }),
        ('Justification', {
            'fields': ('justification', 'justification_status', 'justified_at')
        }),
        ('Validation RH', {
            'fields': ('validated_by', 'validated_at'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def employee_name(self, obj):
        """Nom complet de l'employé avec lien"""
        if obj.employee:
            url = reverse('admin:users_user_change', args=[obj.employee.id])
            return format_html('<a href="{}">{}</a>', url, obj.employee.get_full_name())
        return '-'
    employee_name.short_description = 'Employé'
    
    def validated_by_name(self, obj):
        """Nom du validateur"""
        if obj.validated_by:
            return obj.validated_by.get_full_name()
        return '-'
    validated_by_name.short_description = 'Validé par'
    
    def approve_justifications(self, request, queryset):
        """Approuver les justifications sélectionnées"""
        from django.utils import timezone
        updated = queryset.update(
            justification_status='APPROUVEE',
            validated_by=request.user,
            validated_at=timezone.now()
        )
        self.message_user(request, f'{updated} justifications approuvées.')
    approve_justifications.short_description = 'Approuver les justifications sélectionnées'
    
    def reject_justifications(self, request, queryset):
        """Refuser les justifications sélectionnées"""
        from django.utils import timezone
        updated = queryset.update(
            justification_status='REFUSEE',
            validated_by=request.user,
            validated_at=timezone.now()
        )
        self.message_user(request, f'{updated} justifications refusées.')
    reject_justifications.short_description = 'Refuser les justifications sélectionnées'

@admin.register(BiometricLog)
class BiometricLogAdmin(admin.ModelAdmin):
    """Admin pour la gestion des logs biométriques"""
    list_display = [
        'biometric_id', 'employee_name', 'log_type', 'timestamp', 
        'device_id', 'processed', 'created_at'
    ]
    list_filter = [
        'log_type', 'processed', 'timestamp', 'device_id'
    ]
    search_fields = [
        'biometric_id', 'device_id', 'employee__first_name', 'employee__last_name'
    ]
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    
    readonly_fields = [
        'processed', 'employee', 'created_at'
    ]
    
    fieldsets = (
        ('Données biométriques', {
            'fields': ('biometric_id', 'log_type', 'timestamp', 'device_id')
        }),
        ('Traitement', {
            'fields': ('processed', 'employee'),
            'classes': ('collapse',)
        }),
        ('Données brutes', {
            'fields': ('raw_data',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def employee_name(self, obj):
        """Nom de l'employé associé"""
        if obj.employee:
            return obj.employee.get_full_name()
        return 'Employé non trouvé'
    employee_name.short_description = 'Employé'
    
    actions = ['reprocess_logs']
    
    def reprocess_logs(self, request, queryset):
        """Retraiter les logs sélectionnés"""
        processed = 0
        for log in queryset:
            if log.process_log():
                processed += 1
        
        self.message_user(request, f'{processed} logs retraités avec succès.')
    reprocess_logs.short_description = 'Retraiter les logs sélectionnés' 