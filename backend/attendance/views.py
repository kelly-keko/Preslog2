from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count, Avg
from datetime import datetime, date, timedelta
from .models import Presence, Retard, Absence, BiometricLog
from .serializers import (
    PresenceSerializer, RetardSerializer, AbsenceSerializer, BiometricLogSerializer,
    RetardJustificationSerializer, RetardValidationSerializer,
    AbsenceJustificationSerializer, AbsenceValidationSerializer,
    BiometricLogCreateSerializer
)

User = get_user_model()

class IsRHOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée : RH peut tout faire, autres utilisateurs lecture seule
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['DG', 'RH']

class IsOwnerOrRH(permissions.BasePermission):
    """
    Permission : propriétaire ou RH peut modifier
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['DG', 'RH']:
            return True
        return obj.employee == request.user

class PresenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des présences
    """
    serializer_class = PresenceSerializer
    permission_classes = [IsRHOrReadOnly]
    
    def get_queryset(self):
        """Filtrer les présences selon le rôle de l'utilisateur"""
        user = self.request.user
        
        if user.role in ['DG', 'RH']:
            # RH et DG voient toutes les présences
            queryset = Presence.objects.all()
        else:
            # Employé ne voit que ses propres présences
            queryset = Presence.objects.filter(employee=user)
        
        # Filtres optionnels
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        employee_id = self.request.query_params.get('employee_id')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if employee_id and user.role in ['DG', 'RH']:
            queryset = queryset.filter(employee_id=employee_id)
        
        return queryset.select_related('employee').order_by('-date', '-created_at')
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Obtenir les statistiques de présence"""
        user = request.user
        
        # Période par défaut : 30 derniers jours
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        
        # Ajuster selon les paramètres
        if 'start_date' in request.query_params:
            start_date = datetime.strptime(request.query_params['start_date'], '%Y-%m-%d').date()
        if 'end_date' in request.query_params:
            end_date = datetime.strptime(request.query_params['end_date'], '%Y-%m-%d').date()
        
        # Filtrer les présences
        if user.role in ['DG', 'RH']:
            presences = Presence.objects.filter(date__range=[start_date, end_date])
        else:
            presences = Presence.objects.filter(employee=user, date__range=[start_date, end_date])
        
        # Calculer les statistiques
        total_presences = presences.count()
        
        # Filtrer les absences selon le rôle
        if user.role in ['DG', 'RH']:
            total_absences = Absence.objects.filter(date__range=[start_date, end_date]).count()
            total_retards = Retard.objects.filter(date__range=[start_date, end_date]).count()
        else:
            total_absences = Absence.objects.filter(employee=user, date__range=[start_date, end_date]).count()
            total_retards = Retard.objects.filter(employee=user, date__range=[start_date, end_date]).count()
        
        # Heures moyennes travaillées
        avg_hours = presences.aggregate(
            avg_hours=Avg('total_hours')
        )['avg_hours'] or 0
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'statistics': {
                'total_presences': total_presences,
                'total_absences': total_absences,
                'total_retards': total_retards,
                'avg_hours_per_day': round(avg_hours, 2)
            }
        })
    
    @action(detail=False, methods=['post'])
    def manual_punch(self, request):
        """Pointage manuel (pour les tests ou corrections)"""
        if request.user.role not in ['DG', 'RH']:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        employee_id = request.data.get('employee_id')
        punch_type = request.data.get('punch_type')  # 'in' ou 'out'
        punch_time = request.data.get('punch_time')  # 'HH:MM' ou None pour maintenant
        
        try:
            employee = User.objects.get(id=employee_id, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Employé non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Heure de pointage
        if punch_time:
            punch_datetime = datetime.strptime(f"{date.today()} {punch_time}", "%Y-%m-%d %H:%M")
        else:
            punch_datetime = timezone.now()
        
        # Créer ou mettre à jour la présence
        presence, created = Presence.objects.get_or_create(
            employee=employee,
            date=punch_datetime.date(),
            defaults={}
        )
        
        if punch_type == 'in':
            presence.time_in = punch_datetime.time()
        elif punch_type == 'out':
            presence.time_out = punch_datetime.time()
        
        presence.save()
        
        serializer = self.get_serializer(presence)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RetardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la gestion des retards
    """
    serializer_class = RetardSerializer
    permission_classes = [IsRHOrReadOnly]
    
    def get_queryset(self):
        """Filtrer les retards selon le rôle de l'utilisateur"""
        user = self.request.user
        
        if user.role in ['DG', 'RH']:
            queryset = Retard.objects.all()
        else:
            queryset = Retard.objects.filter(employee=user)
        
        # Filtres
        status_filter = self.request.query_params.get('status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if status_filter:
            queryset = queryset.filter(justification_status=status_filter)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.select_related('employee', 'presence', 'validated_by').order_by('-date', '-created_at')
    
    @action(detail=True, methods=['patch'])
    def justify(self, request, pk=None):
        """Justifier un retard"""
        retard = self.get_object()
        
        # Vérifier que l'utilisateur peut justifier ce retard
        if request.user != retard.employee and request.user.role not in ['DG', 'RH']:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = RetardJustificationSerializer(
            retard, 
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def validate(self, request, pk=None):
        """Valider ou refuser une justification de retard (RH uniquement)"""
        if request.user.role not in ['DG', 'RH']:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        retard = self.get_object()
        serializer = RetardValidationSerializer(
            retard, 
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AbsenceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la gestion des absences
    """
    serializer_class = AbsenceSerializer
    permission_classes = [IsRHOrReadOnly]
    
    def get_queryset(self):
        """Filtrer les absences selon le rôle de l'utilisateur"""
        user = self.request.user
        
        if user.role in ['DG', 'RH']:
            queryset = Absence.objects.all()
        else:
            queryset = Absence.objects.filter(employee=user)
        
        # Filtres
        status_filter = self.request.query_params.get('status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if status_filter:
            queryset = queryset.filter(justification_status=status_filter)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.select_related('employee', 'validated_by').order_by('-date', '-created_at')
    
    @action(detail=True, methods=['patch'])
    def justify(self, request, pk=None):
        """Justifier une absence"""
        absence = self.get_object()
        
        # Vérifier que l'utilisateur peut justifier cette absence
        if request.user != absence.employee and request.user.role not in ['DG', 'RH']:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AbsenceJustificationSerializer(
            absence, 
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def validate(self, request, pk=None):
        """Valider ou refuser une justification d'absence (RH uniquement)"""
        if request.user.role not in ['DG', 'RH']:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        absence = self.get_object()
        serializer = AbsenceValidationSerializer(
            absence, 
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BiometricLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des logs biométriques
    """
    serializer_class = BiometricLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les logs selon le rôle de l'utilisateur"""
        user = self.request.user
        
        if user.role in ['DG', 'RH']:
            queryset = BiometricLog.objects.all()
        else:
            queryset = BiometricLog.objects.filter(employee=user)
        
        return queryset.select_related('employee').order_by('-timestamp')
    
    def get_serializer_class(self):
        """Utiliser un sérialiseur différent pour la création via API"""
        if self.action == 'create':
            return BiometricLogCreateSerializer
        return BiometricLogSerializer
    
    @action(detail=False, methods=['post'])
    def receive_punch(self, request):
        """
        Endpoint pour recevoir les données de pointage du dispositif biométrique
        Format attendu :
        {
            "biometric_id": "12345",
            "log_type": "ENTREE",
            "timestamp": "2024-01-15T08:30:00Z",
            "device_id": "DEVICE_001",
            "raw_data": {...}
        }
        """
        serializer = BiometricLogCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                log = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Pointage enregistré avec succès',
                    'log_id': log.id,
                    'employee': log.employee.get_full_name() if log.employee else None
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_absences(self, request):
        """
        Créer automatiquement les absences pour les employés qui n'ont pas pointé
        Cette action peut être appelée manuellement ou via un cron job
        """
        if request.user.role not in ['DG', 'RH']:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Date pour laquelle créer les absences (par défaut hier)
        absence_date = request.data.get('date', (date.today() - timedelta(days=1)).isoformat())
        
        # Récupérer tous les employés actifs
        employees = User.objects.filter(is_active=True, role='EMPLOYE')
        
        absences_created = 0
        
        for employee in employees:
            # Vérifier s'il y a une présence pour cette date
            presence_exists = Presence.objects.filter(
                employee=employee, 
                date=absence_date
            ).exists()
            
            # Vérifier s'il y a déjà une absence pour cette date
            absence_exists = Absence.objects.filter(
                employee=employee, 
                date=absence_date
            ).exists()
            
            # Créer l'absence si pas de présence et pas d'absence
            if not presence_exists and not absence_exists:
                Absence.objects.create(
                    employee=employee,
                    date=absence_date
                )
                absences_created += 1
        
        return Response({
            'success': True,
            'message': f'{absences_created} absences créées pour le {absence_date}',
            'absences_created': absences_created
        }) 