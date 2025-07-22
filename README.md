# PresLog - Gestion des Présences SECEL SARL

Application web de gestion des présences du personnel développée pour SECEL SARL.

## 🎯 Fonctionnalités

- **Authentification sécurisée** avec JWT
- **Gestion des présences** quotidiennes
- **Gestion des absences** avec justificatifs
- **Suivi des retards** avec validation RH
- **Tableaux de bord** avec statistiques
- **Rapports** exportables (PDF/Excel)
- **Interface responsive** pour tous les appareils

## 👥 Rôles utilisateurs

- **Employé** : Consultation de ses présences, soumission de justificatifs
- **Ressources Humaines** : Gestion des absences, retards, utilisateurs
- **Directeur Général** : Accès complet, rapports globaux

## 🛠️ Technologies utilisées

### Backend
- **Django 5.0.7** - Framework web Python
- **Django REST Framework** - API REST
- **SQLite** - Base de données
- **JWT** - Authentification sécurisée
- **Pillow** - Gestion des images
- **ReportLab** - Génération de PDF

### Frontend
- **React 18** - Interface utilisateur
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - Client HTTP
- **Lucide React** - Icônes
- **React Hook Form** - Gestion des formulaires

## 📁 Structure du projet

```
Preslog/
├── backend/                 # API Django
│   ├── preslog/            # Configuration principale
│   ├── users/              # Gestion des utilisateurs
│   ├── presences/          # Gestion des présences
│   ├── manage.py           # Script de gestion Django
│   └── requirements.txt    # Dépendances Python
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── contexts/       # Contextes React
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── ...
│   ├── package.json        # Dépendances Node.js
│   └── vite.config.js      # Configuration Vite
└── docs/                   # Documentation
```

## 🚀 Installation et démarrage

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### Backend (Django)

1. **Créer l'environnement virtuel**
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activer l'environnement virtuel**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurer la base de données**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Créer un superutilisateur**
   ```bash
   python manage.py createsuperuser
   ```

6. **Démarrer le serveur**
   ```bash
   python manage.py runserver
   ```

Le backend sera accessible sur `http://localhost:8000`

### Frontend (React)

1. **Installer les dépendances**
   ```bash
   cd frontend
   npm install
   ```

2. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

Le frontend sera accessible sur `http://localhost:3000`

## 📊 Configuration initiale

### Créer les premiers utilisateurs

1. Accédez à l'admin Django : `http://localhost:8000/admin`
2. Connectez-vous avec votre superutilisateur
3. Créez des utilisateurs avec différents rôles :
   - **Employé** : `role = 'EMPLOYE'`
   - **RH** : `role = 'RH'`
   - **DG** : `role = 'DG'`

### Configuration du dispositif de pointage

L'application est conçue pour intégrer un dispositif de pointage d'empreinte digitale. Pour l'intégration :

1. Créez un endpoint API pour recevoir les données du dispositif
2. Configurez l'URL du dispositif dans les paramètres
3. Testez la synchronisation des données

## 🔧 API Endpoints

### Authentification
- `POST /api/token/` - Connexion
- `POST /api/token/refresh/` - Rafraîchir le token

### Utilisateurs
- `GET /api/users/me/` - Informations utilisateur connecté
- `GET /api/users/` - Liste des utilisateurs (RH/DG)
- `POST /api/users/` - Créer un utilisateur (RH/DG)

### Présences
- `GET /api/presences/` - Liste des présences
- `POST /api/presences/` - Créer une présence
- `PUT /api/presences/{id}/` - Modifier une présence

### Absences
- `GET /api/absences/` - Liste des absences
- `POST /api/absences/` - Demander une absence
- `PUT /api/absences/{id}/` - Traiter une absence (RH)

### Retards
- `GET /api/retards/` - Liste des retards
- `POST /api/retards/` - Justifier un retard
- `PUT /api/retards/{id}/` - Traiter un retard (RH)

## 🎨 Interface utilisateur

L'interface utilise Tailwind CSS avec une palette de couleurs personnalisée pour SECEL SARL :

- **Couleur principale** : Bleu SECEL (`#0ea5e9`)
- **Couleurs d'état** :
  - Vert : Présent/Approuvé
  - Jaune : En attente/Retard
  - Rouge : Absent/Rejeté

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte à :
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

## 🔒 Sécurité

- **JWT** pour l'authentification
- **CORS** configuré pour le développement
- **Permissions** basées sur les rôles
- **Validation** des données côté serveur
- **HTTPS** recommandé en production

## 📈 Fonctionnalités avancées

### Rapports et exports
- **PDF** : Rapports mensuels/trimestriels
- **Excel** : Données brutes exportables
- **Graphiques** : Statistiques visuelles

### Notifications
- **Email** : Notifications automatiques
- **In-app** : Alertes en temps réel
- **SMS** : Notifications urgentes (optionnel)

## 🚀 Déploiement

### Production
1. **Backend** : Déployer sur serveur Python (Gunicorn + Nginx)
2. **Frontend** : Build et déployer sur CDN
3. **Base de données** : Migrer vers PostgreSQL
4. **HTTPS** : Configurer SSL/TLS

### Variables d'environnement
```bash
# Backend
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://...

# Frontend
VITE_API_URL=https://api.your-domain.com
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est développé pour SECEL SARL. Tous droits réservés.

## 📞 Support

Pour toute question ou support :
- **Email** : support@secel.com
- **Téléphone** : +237 XXX XXX XXX

---

**Développé avec ❤️ pour SECEL SARL** 