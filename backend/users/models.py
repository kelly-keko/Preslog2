from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('EMPLOYE', 'Employé'),
        ('RH', 'Ressources Humaines'),
        ('DG', 'Directeur Général'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='EMPLOYE')
    matricule = models.CharField(max_length=20, unique=True, null=True, blank=True)
    telephone = models.CharField(max_length=15, null=True, blank=True)
    date_embauche = models.DateField(null=True, blank=True)
    departement = models.CharField(max_length=100, null=True, blank=True)
    poste = models.CharField(max_length=100, null=True, blank=True)
    # --- Ajout pour le pointage biométrique ---
    biometric_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        verbose_name="ID biométrique (empreinte)"
    )
    # --- Archivage (employé actif ou non) ---
    is_active = models.BooleanField(default=True, verbose_name="Actif (non archivé)")
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        return f"{self.get_full_name()} - {self.get_role_display()}"
    
    @property
    def is_rh(self):
        return self.role in ['RH', 'DG']
    
    @property
    def is_dg(self):
        return self.role == 'DG' 