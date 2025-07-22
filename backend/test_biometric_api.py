#!/usr/bin/env python3
"""
Script de test pour l'API de pointage biométrique
Ce script permet de tester les différents endpoints de l'API
"""

import requests
import json
from datetime import datetime, timedelta
import time

# Configuration de l'API
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def get_auth_token(username, password):
    """Obtenir un token d'authentification"""
    url = f"{API_BASE}/token/"
    data = {
        "username": username,
        "password": password
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            return response.json()["access"]
        else:
            print(f"Erreur d'authentification: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Erreur de connexion: {e}")
        return None

def test_biometric_punch(token, biometric_id="12345", log_type="ENTREE"):
    """Tester la réception d'un pointage biométrique"""
    url = f"{API_BASE}/biometric/receive-punch/"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Données de test
    data = {
        "biometric_id": biometric_id,
        "log_type": log_type,
        "timestamp": datetime.now().isoformat(),
        "device_id": "DEVICE_001",
        "raw_data": {
            "fingerprint_quality": "high",
            "temperature": "36.5",
            "location": "entrance"
        }
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\n=== Test pointage biométrique ===")
        print(f"URL: {url}")
        print(f"Données: {json.dumps(data, indent=2)}")
        print(f"Status: {response.status_code}")
        print(f"Réponse: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Pointage enregistré avec succès!")
            print(f"   - Log ID: {result.get('log_id')}")
            print(f"   - Employé: {result.get('employee')}")
        else:
            print(f"❌ Erreur lors du pointage")
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

def test_manual_punch(token, employee_id=1, punch_type="in"):
    """Tester le pointage manuel"""
    url = f"{API_BASE}/presences/manual-punch/"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "employee_id": employee_id,
        "punch_type": punch_type,
        "punch_time": datetime.now().strftime("%H:%M")
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\n=== Test pointage manuel ===")
        print(f"URL: {url}")
        print(f"Données: {json.dumps(data, indent=2)}")
        print(f"Status: {response.status_code}")
        print(f"Réponse: {response.text}")
        
        if response.status_code == 200:
            print(f"✅ Pointage manuel réussi!")
        else:
            print(f"❌ Erreur lors du pointage manuel")
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

def test_create_absences(token, date=None):
    """Tester la création automatique d'absences"""
    url = f"{API_BASE}/biometric/create-absences/"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    if not date:
        date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    data = {
        "date": date
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\n=== Test création d'absences ===")
        print(f"URL: {url}")
        print(f"Données: {json.dumps(data, indent=2)}")
        print(f"Status: {response.status_code}")
        print(f"Réponse: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Absences créées avec succès!")
            print(f"   - Nombre d'absences: {result.get('absences_created')}")
            print(f"   - Message: {result.get('message')}")
        else:
            print(f"❌ Erreur lors de la création d'absences")
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

def test_get_presences(token):
    """Tester la récupération des présences"""
    url = f"{API_BASE}/presences/"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\n=== Test récupération présences ===")
        print(f"URL: {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Présences récupérées!")
            print(f"   - Nombre de présences: {len(data.get('results', []))}")
            print(f"   - Total: {data.get('count', 0)}")
        else:
            print(f"❌ Erreur lors de la récupération")
            print(f"Réponse: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

def test_get_statistics(token):
    """Tester la récupération des statistiques"""
    url = f"{API_BASE}/presences/statistics/"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\n=== Test statistiques ===")
        print(f"URL: {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statistiques récupérées!")
            print(f"   - Période: {data.get('period', {})}")
            print(f"   - Statistiques: {json.dumps(data.get('statistics', {}), indent=2)}")
        else:
            print(f"❌ Erreur lors de la récupération")
            print(f"Réponse: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

def main():
    """Fonction principale de test"""
    print("🧪 Tests de l'API de pointage biométrique")
    print("=" * 50)
    
    # Informations de connexion (à adapter selon vos données)
    username = "admin"  # Remplacer par un utilisateur existant
    password = "admin123"  # Remplacer par le mot de passe correct
    
    # Obtenir le token d'authentification
    print(f"🔐 Authentification avec {username}...")
    token = get_auth_token(username, password)
    
    if not token:
        print("❌ Impossible d'obtenir le token d'authentification")
        print("Vérifiez les identifiants et que le serveur est démarré")
        return
    
    print(f"✅ Token obtenu: {token[:20]}...")
    
    # Tests de l'API
    print("\n" + "=" * 50)
    
    # Test 1: Pointage biométrique (entrée)
    test_biometric_punch(token, "12345", "ENTREE")
    time.sleep(1)
    
    # Test 2: Pointage biométrique (sortie)
    test_biometric_punch(token, "12345", "SORTIE")
    time.sleep(1)
    
    # Test 3: Pointage manuel
    test_manual_punch(token, 1, "in")
    time.sleep(1)
    
    # Test 4: Récupération des présences
    test_get_presences(token)
    time.sleep(1)
    
    # Test 5: Statistiques
    test_get_statistics(token)
    time.sleep(1)
    
    # Test 6: Création d'absences (pour hier)
    test_create_absences(token)
    
    print("\n" + "=" * 50)
    print("✅ Tests terminés!")
    
    # Instructions d'utilisation
    print("\n📋 Instructions d'utilisation:")
    print("1. Assurez-vous que le serveur Django est démarré (python manage.py runserver)")
    print("2. Créez des utilisateurs avec des biometric_id dans l'admin Django")
    print("3. Testez avec différents biometric_id et types de pointage")
    print("4. Vérifiez les résultats dans l'admin Django")
    
    print("\n🔗 Endpoints disponibles:")
    print(f"   - Pointage biométrique: POST {API_BASE}/biometric/receive-punch/")
    print(f"   - Pointage manuel: POST {API_BASE}/presences/manual-punch/")
    print(f"   - Création absences: POST {API_BASE}/biometric/create-absences/")
    print(f"   - Liste présences: GET {API_BASE}/presences/")
    print(f"   - Statistiques: GET {API_BASE}/presences/statistics/")

if __name__ == "__main__":
    main() 