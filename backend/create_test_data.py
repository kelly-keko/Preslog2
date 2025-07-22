#!/usr/bin/env python
"""
Script pour créer des données de test pour l'application PresLog
"""
import os
import sys
import django
from datetime import datetime, date, timedelta
from django.utils import timezone

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'preslog.settings')
django.setup()

from django.contrib.auth import get_user_model
from attendance.models import Presence, Retard, Absence

User = get_user_model()

def create_test_data():
    """Créer des données de test"""
    
    print("Création des données de test...")
    
    # Créer un utilisateur de test si il n'existe pas
    user, created = User.objects.get_or_create(
        username='test_employee',
        defaults={
            'email': 'test@secel.com',
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'role': 'EMPLOYE',
            'is_active': True
        }
    )
    
    if created:
        user.set_password('test123')
        user.save()
        print(f"✅ Utilisateur créé: {user.first_name} {user.last_name}")
    else:
        print(f"✅ Utilisateur existant: {user.first_name} {user.last_name}")
    
    # Créer des présences pour les 7 derniers jours
    today = date.today()
    for i in range(7):
        test_date = today - timedelta(days=i)
        
        # Créer une présence
        presence, created = Presence.objects.get_or_create(
            employee=user,
            date=test_date,
            defaults={
                'time_in': datetime.strptime('08:00', '%H:%M').time(),
                'time_out': datetime.strptime('17:00', '%H:%M').time(),
                'total_hours': 8.0
            }
        )
        
        if created:
            print(f"✅ Présence créée pour {test_date}")
    
    # Créer quelques retards
    for i in range(2):
        retard_date = today - timedelta(days=i+1)
        retard, created = Retard.objects.get_or_create(
            employee=user,
            date=retard_date,
            defaults={
                'delay_minutes': 15,
                'justification': 'Trafic dense',
                'justification_status': 'EN_ATTENTE'
            }
        )
        
        if created:
            print(f"✅ Retard créé pour {retard_date}")
    
    # Créer une absence
    absence_date = today - timedelta(days=3)
    absence, created = Absence.objects.get_or_create(
        employee=user,
        date=absence_date,
        defaults={
            'absence_type': 'MALADIE',
            'justification': 'Certificat médical',
            'justification_status': 'APPROUVEE'
        }
    )
    
    if created:
        print(f"✅ Absence créée pour {absence_date}")
    
    print("\n🎉 Données de test créées avec succès!")
    print(f"📊 Statistiques:")
    print(f"   - Présences: {Presence.objects.count()}")
    print(f"   - Retards: {Retard.objects.count()}")
    print(f"   - Absences: {Absence.objects.count()}")

if __name__ == "__main__":
    create_test_data() 