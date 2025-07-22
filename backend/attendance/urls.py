from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PresenceViewSet, 
    RetardViewSet, 
    AbsenceViewSet, 
    BiometricLogViewSet
)

# Configuration du routeur pour les ViewSets
router = DefaultRouter()
router.register(r'presences', PresenceViewSet, basename='presence')
router.register(r'retards', RetardViewSet, basename='retard')
router.register(r'absences', AbsenceViewSet, basename='absence')
router.register(r'biometric-logs', BiometricLogViewSet, basename='biometric-log')

# URLs de l'application
urlpatterns = [
    # Inclure toutes les routes du routeur
    path('', include(router.urls)),
    
    # Routes personnalisées pour les actions spécifiques
    path('api/', include([
        # Statistiques de présence
        path('presences/statistics/', 
             PresenceViewSet.as_view({'get': 'statistics'}), 
             name='presence-statistics'),
        
        # Pointage manuel (RH uniquement)
        path('presences/manual-punch/', 
             PresenceViewSet.as_view({'post': 'manual_punch'}), 
             name='manual-punch'),
        
        # Réception des données biométriques
        path('biometric/receive-punch/', 
             BiometricLogViewSet.as_view({'post': 'receive_punch'}), 
             name='receive-biometric-punch'),
        
        # Création automatique des absences
        path('biometric/create-absences/', 
             BiometricLogViewSet.as_view({'post': 'create_absences'}), 
             name='create-absences'),
        
        # Justification de retard
        path('retards/<int:pk>/justify/', 
             RetardViewSet.as_view({'patch': 'justify'}), 
             name='retard-justify'),
        
        # Validation de justification de retard (RH)
        path('retards/<int:pk>/validate/', 
             RetardViewSet.as_view({'patch': 'validate'}), 
             name='retard-validate'),
        
        # Justification d'absence
        path('absences/<int:pk>/justify/', 
             AbsenceViewSet.as_view({'patch': 'justify'}), 
             name='absence-justify'),
        
        # Validation de justification d'absence (RH)
        path('absences/<int:pk>/validate/', 
             AbsenceViewSet.as_view({'patch': 'validate'}), 
             name='absence-validate'),
    ])),
]

# Documentation des endpoints disponibles :
"""
ENDPOINTS DISPONIBLES :

PRÉSENCES :
- GET /api/presences/ - Liste des présences
- POST /api/presences/ - Créer une présence
- GET /api/presences/{id}/ - Détail d'une présence
- PUT /api/presences/{id}/ - Modifier une présence
- DELETE /api/presences/{id}/ - Supprimer une présence
- GET /api/presences/statistics/ - Statistiques de présence
- POST /api/presences/manual-punch/ - Pointage manuel (RH)

RETARDS :
- GET /api/retards/ - Liste des retards
- GET /api/retards/{id}/ - Détail d'un retard
- PATCH /api/retards/{id}/justify/ - Justifier un retard
- PATCH /api/retards/{id}/validate/ - Valider justification (RH)

ABSENCES :
- GET /api/absences/ - Liste des absences
- GET /api/absences/{id}/ - Détail d'une absence
- PATCH /api/absences/{id}/justify/ - Justifier une absence
- PATCH /api/absences/{id}/validate/ - Valider justification (RH)

LOGS BIOMÉTRIQUES :
- GET /api/biometric-logs/ - Liste des logs
- POST /api/biometric-logs/ - Créer un log
- GET /api/biometric-logs/{id}/ - Détail d'un log
- POST /api/biometric/receive-punch/ - Réception pointage biométrique
- POST /api/biometric/create-absences/ - Créer absences automatiques (RH)

PARAMÈTRES DE FILTRAGE :
- date_from : Date de début (YYYY-MM-DD)
- date_to : Date de fin (YYYY-MM-DD)
- status : Statut de justification (EN_ATTENTE, APPROUVEE, REFUSEE)
- employee_id : ID de l'employé (RH/DG uniquement)

EXEMPLE D'UTILISATION :
GET /api/presences/?date_from=2024-01-01&date_to=2024-01-31
GET /api/retards/?status=EN_ATTENTE
POST /api/biometric/receive-punch/ avec body JSON
""" 