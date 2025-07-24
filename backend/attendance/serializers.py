from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Presence, Retard, Absence, BiometricLog
from datetime import datetime, time

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les informations utilisateur dans les présences"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'full_name', 'biometric_id']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class PresenceSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les présences avec calculs automatiques"""
    employee = UserSerializer(read_only=True)
    employee_id = serializers.IntegerField(write_only=True)
    date_display = serializers.SerializerMethodField()
    time_in_display = serializers.SerializerMethodField()
    time_out_display = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    total_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Presence
        fields = [
            'id', 'employee', 'employee_id', 'date', 'date_display',
            'time_in', 'time_in_display', 'time_out', 'time_out_display',
            'is_late', 'delay_minutes', 'status', 'total_hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['is_late', 'delay_minutes', 'created_at', 'updated_at']
    
    def get_date_display(self, obj):
        """Format français de la date"""
        return obj.date.strftime('%d/%m/%Y')
    
    def get_time_in_display(self, obj):
        """Format de l'heure d'entrée"""
        return obj.time_in.strftime('%H:%M') if obj.time_in else '-'
    
    def get_time_out_display(self, obj):
        """Format de l'heure de sortie"""
        return obj.time_out.strftime('%H:%M') if obj.time_out else '-'
    
    def get_status(self, obj):
        """Statut de la présence"""
        if not obj.time_in:
            return 'ABSENT'
        elif not obj.time_out:
            return 'EN_COURS'
        else:
            return 'TERMINE'
    
    def get_total_hours(self, obj):
        """Calculer le total des heures travaillées (ne compte pas après 18h00)"""
        if obj.time_in and obj.time_out:
            from datetime import datetime, time
            start = datetime.combine(obj.date, obj.time_in)
            limit = time(18, 0)
            end_time = obj.time_out if obj.time_out <= limit else limit
            end = datetime.combine(obj.date, end_time)
            if end < start:
                return 0
            diff = end - start
            hours = diff.total_seconds() / 3600
            return round(hours, 2)
        return 0
    
    def validate(self, data):
        """Validation des données de présence"""
        # Vérifier que l'employé existe
        try:
            employee = User.objects.get(id=data['employee_id'], is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("Employé non trouvé")
        
        # Vérifier qu'il n'y a pas déjà une présence pour cette date
        if self.instance is None:  # Nouvelle présence
            if Presence.objects.filter(employee=employee, date=data['date']).exists():
                raise serializers.ValidationError("Une présence existe déjà pour cette date")
        
        return data
    
    def create(self, validated_data):
        """Créer une nouvelle présence"""
        employee_id = validated_data.pop('employee_id')
        employee = User.objects.get(id=employee_id)
        return Presence.objects.create(employee=employee, **validated_data)

class RetardSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les retards avec justifications"""
    employee = UserSerializer(read_only=True)
    presence = PresenceSerializer(read_only=True)
    date_display = serializers.SerializerMethodField()
    expected_time_display = serializers.SerializerMethodField()
    actual_time_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    validated_by_name = serializers.SerializerMethodField()
    justification_file = serializers.FileField(read_only=True)
    
    class Meta:
        model = Retard
        fields = [
            'id', 'employee', 'presence', 'date', 'date_display',
            'expected_time', 'expected_time_display', 'actual_time', 'actual_time_display',
            'delay_minutes', 'justification', 'justification_file', 'justification_status', 'status_display',
            'justified_at', 'validated_by', 'validated_by_name', 'validated_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'employee', 'presence', 'date', 'expected_time', 'actual_time', 
            'delay_minutes', 'justified_at', 'justification_file', 'validated_by', 'validated_at',
            'created_at', 'updated_at'
        ]
    
    def get_date_display(self, obj):
        return obj.date.strftime('%d/%m/%Y')
    
    def get_expected_time_display(self, obj):
        return obj.expected_time.strftime('%H:%M')
    
    def get_actual_time_display(self, obj):
        return obj.actual_time.strftime('%H:%M')
    
    def get_status_display(self, obj):
        return dict(Retard.STATUS_CHOICES)[obj.justification_status]
    
    def get_validated_by_name(self, obj):
        if obj.validated_by:
            return f"{obj.validated_by.first_name} {obj.validated_by.last_name}"
        return None

class RetardJustificationSerializer(serializers.Serializer):
    """Sérialiseur pour justifier un retard"""
    justification = serializers.CharField(max_length=1000, required=True)
    justification_file = serializers.FileField(required=False, allow_null=True)
    
    def update(self, instance, validated_data):
        """Mettre à jour la justification d'un retard"""
        instance.justification = validated_data['justification']
        if 'justification_file' in validated_data:
            instance.justification_file = validated_data['justification_file']
        instance.justification_status = 'EN_ATTENTE'
        instance.justified_at = datetime.now()
        instance.save()
        return instance

class RetardValidationSerializer(serializers.Serializer):
    """Sérialiseur pour valider/refuser une justification de retard"""
    status = serializers.ChoiceField(choices=['APPROUVEE', 'REFUSEE'])
    
    def update(self, instance, validated_data):
        """Valider ou refuser une justification de retard"""
        instance.justification_status = validated_data['status']
        instance.validated_by = self.context['request'].user
        instance.validated_at = datetime.now()
        instance.save()
        return instance

class AbsenceSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les absences avec justifications"""
    employee = UserSerializer(read_only=True)
    date_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    validated_by_name = serializers.SerializerMethodField()
    justification_file = serializers.FileField(read_only=True)
    
    class Meta:
        model = Absence
        fields = [
            'id', 'employee', 'date', 'date_display', 'justification', 'justification_file',
            'justification_status', 'status_display', 'justified_at',
            'validated_by', 'validated_by_name', 'validated_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'employee', 'date', 'justified_at', 'justification_file', 'validated_by', 
            'validated_at', 'created_at', 'updated_at'
        ]
    
    def get_date_display(self, obj):
        return obj.date.strftime('%d/%m/%Y')
    
    def get_status_display(self, obj):
        return dict(Absence.STATUS_CHOICES)[obj.justification_status]
    
    def get_validated_by_name(self, obj):
        if obj.validated_by:
            return f"{obj.validated_by.first_name} {obj.validated_by.last_name}"
        return None

class AbsenceJustificationSerializer(serializers.Serializer):
    """Sérialiseur pour justifier une absence"""
    justification = serializers.CharField(max_length=1000, required=True)
    justification_file = serializers.FileField(required=False, allow_null=True)
    
    def update(self, instance, validated_data):
        """Mettre à jour la justification d'une absence"""
        instance.justification = validated_data['justification']
        if 'justification_file' in validated_data:
            instance.justification_file = validated_data['justification_file']
        instance.justification_status = 'EN_ATTENTE'
        instance.justified_at = datetime.now()
        instance.save()
        return instance

class AbsenceValidationSerializer(serializers.Serializer):
    """Sérialiseur pour valider/refuser une justification d'absence"""
    status = serializers.ChoiceField(choices=['APPROUVEE', 'REFUSEE'])
    
    def update(self, instance, validated_data):
        """Valider ou refuser une justification d'absence"""
        instance.justification_status = validated_data['status']
        instance.validated_by = self.context['request'].user
        instance.validated_at = datetime.now()
        instance.save()
        return instance

class BiometricLogSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les logs biométriques"""
    timestamp_display = serializers.SerializerMethodField()
    log_type_display = serializers.SerializerMethodField()
    employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BiometricLog
        fields = [
            'id', 'biometric_id', 'log_type', 'log_type_display', 'timestamp', 'timestamp_display',
            'device_id', 'raw_data', 'processed', 'employee', 'employee_name', 'created_at'
        ]
        read_only_fields = ['processed', 'employee', 'created_at']
    
    def get_timestamp_display(self, obj):
        return obj.timestamp.strftime('%d/%m/%Y %H:%M:%S')
    
    def get_log_type_display(self, obj):
        return dict(BiometricLog.LOG_TYPES)[obj.log_type]
    
    def get_employee_name(self, obj):
        if obj.employee:
            return f"{obj.employee.first_name} {obj.employee.last_name}"
        return "Employé non trouvé"
    
    def validate(self, data):
        """Validation des données biométriques"""
        # Vérifier que l'ID biométrique existe
        if not User.objects.filter(biometric_id=data['biometric_id'], is_active=True).exists():
            raise serializers.ValidationError("ID biométrique non reconnu")
        
        return data
    
    def create(self, validated_data):
        """Créer un log biométrique et le traiter"""
        log = BiometricLog.objects.create(**validated_data)
        
        # Traiter automatiquement le log
        success = log.process_log()
        
        if not success:
            # Si le traitement échoue, on peut logger l'erreur
            print(f"Échec du traitement du log biométrique: {log.biometric_id}")
        
        return log

class BiometricLogCreateSerializer(serializers.Serializer):
    """Sérialiseur simplifié pour la création de logs biométriques via API"""
    biometric_id = serializers.CharField(max_length=50)
    log_type = serializers.ChoiceField(choices=BiometricLog.LOG_TYPES)
    timestamp = serializers.DateTimeField()
    device_id = serializers.CharField(max_length=50)
    raw_data = serializers.JSONField(required=False, default=dict)
    
    def create(self, validated_data):
        """Créer et traiter un log biométrique"""
        log = BiometricLog.objects.create(**validated_data)
        log.process_log()
        return log 