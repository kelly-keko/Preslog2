from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Presence, Absence, Retard
from .serializers import (
    PresenceSerializer, PresenceCreateSerializer,
    AbsenceSerializer, AbsenceCreateSerializer, AbsenceUpdateSerializer,
    RetardSerializer, RetardCreateSerializer, RetardUpdateSerializer
)
from users.permissions import IsRHOrReadOnly, IsOwnerOrRH

class PresenceViewSet(viewsets.ModelViewSet):
    queryset = Presence.objects.all()
    serializer_class = PresenceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrRH]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employe', 'date']
    search_fields = ['employe__first_name', 'employe__last_name']
    ordering_fields = ['date', 'heure_arrivee']
    ordering = ['-date', '-heure_arrivee']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_rh:
            return Presence.objects.all()
        return Presence.objects.filter(employe=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PresenceCreateSerializer
        return PresenceSerializer
    
    @action(detail=False, methods=['post'])
    def pointer_entree(self, request):
        """Pointer l'entrée pour aujourd'hui"""
        today = timezone.now().date()
        user = request.user
        
        # Vérifier si déjà pointé aujourd'hui
        if Presence.objects.filter(employe=user, date=today).exists():
            return Response(
                {"detail": "Vous avez déjà pointé votre entrée aujourd'hui"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la présence
        presence = Presence.objects.create(
            employe=user,
            date=today,
            heure_arrivee=timezone.now().time()
        )
        
        serializer = self.get_serializer(presence)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def pointer_sortie(self, request):
        """Pointer la sortie pour aujourd'hui"""
        today = timezone.now().date()
        user = request.user
        
        try:
            presence = Presence.objects.get(employe=user, date=today)
            if presence.heure_depart:
                return Response(
                    {"detail": "Vous avez déjà pointé votre sortie aujourd'hui"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            presence.heure_depart = timezone.now().time()
            presence.save()
            
            serializer = self.get_serializer(presence)
            return Response(serializer.data)
        except Presence.DoesNotExist:
            return Response(
                {"detail": "Vous devez d'abord pointer votre entrée"},
                status=status.HTTP_400_BAD_REQUEST
            )

class AbsenceViewSet(viewsets.ModelViewSet):
    queryset = Absence.objects.all()
    serializer_class = AbsenceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrRH]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employe', 'type_absence', 'statut']
    search_fields = ['employe__first_name', 'employe__last_name', 'motif']
    ordering_fields = ['date_debut', 'date_fin', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_rh:
            return Absence.objects.all()
        return Absence.objects.filter(employe=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AbsenceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AbsenceUpdateSerializer
        return AbsenceSerializer
    
    def perform_update(self, serializer):
        if self.request.user.is_rh:
            serializer.save(
                approuve_par=self.request.user,
                date_approbation=timezone.now()
            )
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def en_attente(self, request):
        """Liste des absences en attente (pour RH)"""
        if not request.user.is_rh:
            return Response(
                {"detail": "Accès non autorisé"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        absences = Absence.objects.filter(statut='EN_ATTENTE')
        serializer = self.get_serializer(absences, many=True)
        return Response(serializer.data)

class RetardViewSet(viewsets.ModelViewSet):
    queryset = Retard.objects.all()
    serializer_class = RetardSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrRH]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employe', 'statut']
    search_fields = ['employe__first_name', 'employe__last_name', 'motif']
    ordering_fields = ['date', 'heure_arrivee_effective']
    ordering = ['-date', '-heure_arrivee_effective']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_rh:
            return Retard.objects.all()
        return Retard.objects.filter(employe=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RetardCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return RetardUpdateSerializer
        return RetardSerializer
    
    def perform_update(self, serializer):
        if self.request.user.is_rh:
            serializer.save(
                approuve_par=self.request.user
            )
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def en_attente(self, request):
        """Liste des retards en attente (pour RH)"""
        if not request.user.is_rh:
            return Response(
                {"detail": "Accès non autorisé"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        retards = Retard.objects.filter(statut='EN_ATTENTE')
        serializer = self.get_serializer(retards, many=True)
        return Response(serializer.data) 