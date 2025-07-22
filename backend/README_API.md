# API de Pointage Biométrique - SECEL SARL

## 📋 Description

Cette API permet la gestion complète du système de pointage biométrique pour SECEL SARL. Elle gère automatiquement les présences, retards, absences et justifications des employés.

## 🏗️ Architecture

### Modèles de données

- **Presence** : Pointages quotidiens (entrée/sortie)
- **Retard** : Retards automatiquement détectés avec justifications
- **Absence** : Absences automatiquement créées pour non-pointage
- **BiometricLog** : Logs bruts du dispositif biométrique

### Logique métier

1. **Pointage à l'heure** → Présence normale
2. **Pointage en retard** → Retard automatique + justification possible
3. **Pas de pointage** → Absence automatique + justification possible
4. **Validation RH** → Approbation/refus des justifications

## 🔗 Endpoints API

### Authentification

```http
POST /api/token/
Content-Type: application/json

{
    "username": "votre_username",
    "password": "votre_password"
}
```

### Pointage Biométrique

#### Réception des données biométriques
```http
POST /api/attendance/biometric/receive-punch/
Authorization: Bearer <token>
Content-Type: application/json

{
    "biometric_id": "12345",
    "log_type": "ENTREE",
    "timestamp": "2024-01-15T08:30:00Z",
    "device_id": "DEVICE_001",
    "raw_data": {
        "fingerprint_quality": "high",
        "temperature": "36.5",
        "location": "entrance"
    }
}
```

**Types de pointage disponibles :**
- `ENTREE` : Pointage d'entrée
- `SORTIE` : Pointage de sortie
- `PAUSE` : Début de pause
- `REPRISE` : Fin de pause

#### Création automatique d'absences
```http
POST /api/attendance/biometric/create-absences/
Authorization: Bearer <token>
Content-Type: application/json

{
    "date": "2024-01-14"
}
```

### Gestion des Présences

#### Liste des présences
```http
GET /api/attendance/presences/
Authorization: Bearer <token>

# Filtres disponibles
GET /api/attendance/presences/?date_from=2024-01-01&date_to=2024-01-31
GET /api/attendance/presences/?employee_id=1
```

#### Statistiques
```http
GET /api/attendance/presences/statistics/
Authorization: Bearer <token>

# Période personnalisée
GET /api/attendance/presences/statistics/?start_date=2024-01-01&end_date=2024-01-31
```

#### Pointage manuel (RH uniquement)
```http
POST /api/attendance/presences/manual-punch/
Authorization: Bearer <token>
Content-Type: application/json

{
    "employee_id": 1,
    "punch_type": "in",
    "punch_time": "08:30"
}
```

### Gestion des Retards

#### Liste des retards
```http
GET /api/attendance/retards/
Authorization: Bearer <token>

# Filtres
GET /api/attendance/retards/?status=EN_ATTENTE
GET /api/attendance/retards/?date_from=2024-01-01
```

#### Justifier un retard
```http
PATCH /api/attendance/retards/{id}/justify/
Authorization: Bearer <token>
Content-Type: application/json

{
    "justification": "Problème de transport, bus en retard"
}
```

#### Valider une justification (RH uniquement)
```http
PATCH /api/attendance/retards/{id}/validate/
Authorization: Bearer <token>
Content-Type: application/json

{
    "status": "APPROUVEE"
}
```

### Gestion des Absences

#### Liste des absences
```http
GET /api/attendance/absences/
Authorization: Bearer <token>

# Filtres
GET /api/attendance/absences/?status=EN_ATTENTE
```

#### Justifier une absence
```http
PATCH /api/attendance/absences/{id}/justify/
Authorization: Bearer <token>
Content-Type: application/json

{
    "justification": "Maladie, certificat médical fourni"
}
```

#### Valider une justification (RH uniquement)
```http
PATCH /api/attendance/absences/{id}/validate/
Authorization: Bearer <token>
Content-Type: application/json

{
    "status": "APPROUVEE"
}
```

## 🔧 Configuration du Dispositif Biométrique

### Format des données attendues

Le dispositif biométrique doit envoyer des requêtes POST vers l'endpoint `/api/attendance/biometric/receive-punch/` avec le format suivant :

```json
{
    "biometric_id": "string",      // ID biométrique de l'employé
    "log_type": "ENTREE|SORTIE|PAUSE|REPRISE",
    "timestamp": "ISO8601",        // Horodatage du pointage
    "device_id": "string",         // Identifiant du dispositif
    "raw_data": {}                 // Données brutes optionnelles
}
```

### Exemple de configuration pour dispositif ZKTeco

```python
import requests
import json
from datetime import datetime

def send_punch_to_api(biometric_id, log_type, device_id="DEVICE_001"):
    """Envoyer un pointage à l'API"""
    
    url = "http://votre-serveur.com/api/attendance/biometric/receive-punch/"
    
    data = {
        "biometric_id": str(biometric_id),
        "log_type": log_type,
        "timestamp": datetime.now().isoformat(),
        "device_id": device_id,
        "raw_data": {
            "device_model": "ZKTeco C3X",
            "firmware_version": "1.0.0"
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_TOKEN"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        return response.status_code == 201
    except Exception as e:
        print(f"Erreur d'envoi: {e}")
        return False
```

## 🧪 Tests

### Script de test automatique

Utilisez le script `test_biometric_api.py` pour tester l'API :

```bash
cd backend
python test_biometric_api.py
```

### Tests manuels avec curl

```bash
# Authentification
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Pointage biométrique
curl -X POST http://localhost:8000/api/attendance/biometric/receive-punch/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biometric_id": "12345",
    "log_type": "ENTREE",
    "timestamp": "2024-01-15T08:30:00Z",
    "device_id": "DEVICE_001"
  }'
```

## 📊 Permissions par Rôle

### DG (Directeur Général)
- ✅ Accès complet à toutes les données
- ✅ Validation des justifications
- ✅ Pointage manuel
- ✅ Création d'absences

### RH (Ressources Humaines)
- ✅ Accès complet à toutes les données
- ✅ Validation des justifications
- ✅ Pointage manuel
- ✅ Création d'absences

### Employé
- ✅ Voir ses propres présences/retards/absences
- ✅ Justifier ses retards et absences
- ❌ Validation des justifications
- ❌ Pointage manuel

## 🔄 Workflow Automatique

### 1. Pointage quotidien
```
Employé pointe → API reçoit données → Présence créée/mise à jour
```

### 2. Détection des retards
```
Pointage après 8h00 → Retard automatique créé → Notification RH
```

### 3. Gestion des absences
```
Fin de journée → Vérification pointages → Absences créées automatiquement
```

### 4. Justifications
```
Employé justifie → Statut "En attente" → RH valide/refuse
```

## 🚀 Déploiement

### Variables d'environnement

```bash
# Production
DEBUG=False
SECRET_KEY=votre-clé-secrète-production
ALLOWED_HOSTS=votre-domaine.com
DATABASE_URL=postgresql://user:pass@host:port/db

# Dispositif biométrique
BIOMETRIC_API_TOKEN=votre-token-securise
```

### Sécurité

1. **HTTPS obligatoire** en production
2. **Token d'API** pour le dispositif biométrique
3. **Rate limiting** sur les endpoints de pointage
4. **Logs de sécurité** pour tous les pointages

## 📝 Logs et Monitoring

### Logs automatiques

- Tous les pointages sont loggés dans `BiometricLog`
- Erreurs de traitement automatiquement enregistrées
- Statistiques disponibles via l'API

### Monitoring recommandé

```python
# Vérification de santé de l'API
GET /api/attendance/presences/statistics/

# Vérification des logs non traités
GET /api/attendance/biometric-logs/?processed=false
```

## 🆘 Dépannage

### Problèmes courants

1. **Pointage non reçu**
   - Vérifier la connectivité réseau
   - Vérifier le format des données
   - Vérifier l'authentification

2. **Employé non trouvé**
   - Vérifier que l'employé a un `biometric_id`
   - Vérifier que l'employé est actif

3. **Erreurs de traitement**
   - Vérifier les logs dans l'admin Django
   - Retraiter les logs via l'admin

### Support

Pour toute question ou problème :
- Consultez les logs dans l'admin Django
- Vérifiez la documentation de l'API
- Contactez l'équipe technique 