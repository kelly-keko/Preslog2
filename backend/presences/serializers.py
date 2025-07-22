from rest_framework import serializers
from .models import Presence, Absence, Retard
from django.contrib.auth import get_user_model

User = get_user_model()

class PresenceSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source='employe.get_full_name', read_only=True)
    duree_travail = serializers.ReadOnlyField()
    
    class Meta:
        model = Presence
        fields = ['id', 'employe', 'employe_nom', 'date', 'heure_arrivee', 
                 'heure_depart', 'duree_travail', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PresenceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presence
        fields = ['date', 'heure_arrivee', 'heure_depart']
    
    def create(self, validated_data):
        validated_data['employe'] = self.context['request'].user
        return super().create(validated_data)

class AbsenceSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source='employe.get_full_name', read_only=True)
    approuve_par_nom = serializers.CharField(source='approuve_par.get_full_name', read_only=True)
    type_absence_display = serializers.CharField(source='get_type_absence_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Absence
        fields = ['id', 'employe', 'employe_nom', 'date_debut', 'date_fin', 
                 'type_absence', 'type_absence_display', 'motif', 'justificatif',
                 'statut', 'statut_display', 'approuve_par', 'approuve_par_nom',
                 'date_approbation', 'commentaire_rh', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AbsenceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Absence
        fields = ['date_debut', 'date_fin', 'type_absence', 'motif', 'justificatif']
    
    def create(self, validated_data):
        validated_data['employe'] = self.context['request'].user
        return super().create(validated_data)

class AbsenceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Absence
        fields = ['statut', 'commentaire_rh']
        read_only_fields = ['employe', 'date_debut', 'date_fin', 'type_absence', 'motif', 'justificatif']

class RetardSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source='employe.get_full_name', read_only=True)
    approuve_par_nom = serializers.CharField(source='approuve_par.get_full_name', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    duree_retard = serializers.ReadOnlyField()
    
    class Meta:
        model = Retard
        fields = ['id', 'employe', 'employe_nom', 'date', 'heure_arrivee_effective',
                 'heure_arrivee_prevue', 'motif', 'justificatif', 'statut',
                 'statut_display', 'approuve_par', 'approuve_par_nom', 'duree_retard',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class RetardCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retard
        fields = ['date', 'heure_arrivee_effective', 'motif', 'justificatif']
    
    def create(self, validated_data):
        validated_data['employe'] = self.context['request'].user
        return super().create(validated_data)

class RetardUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retard
        fields = ['statut']
        read_only_fields = ['employe', 'date', 'heure_arrivee_effective', 'heure_arrivee_prevue', 'motif', 'justificatif'] 