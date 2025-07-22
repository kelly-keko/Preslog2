from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator

User = get_user_model()

class Presence(models.Model):
    """Modèle pour enregistrer les présences quotidiennes"""
    employe = models.ForeignKey(User, on_delete=models.CASCADE, related_name='presences')
    date = models.DateField()
    heure_arrivee = models.TimeField()
    heure_depart = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['employe', 'date']
        verbose_name = 'Présence'
        verbose_name_plural = 'Présences'
    
    def __str__(self):
        return f"{self.employe.get_full_name()} - {self.date}"
    
    @property
    def duree_travail(self):
        """Calculer la durée de travail en heures"""
        if self.heure_depart:
            from datetime import datetime, timedelta
            arrivee = datetime.combine(self.date, self.heure_arrivee)
            depart = datetime.combine(self.date, self.heure_depart)
            duree = depart - arrivee
            return duree.total_seconds() / 3600
        return None

class Absence(models.Model):
    """Modèle pour gérer les absences"""
    TYPE_CHOICES = [
        ('CONGE', 'Congé'),
        ('MALADIE', 'Maladie'),
        ('FORMATION', 'Formation'),
        ('MISSION', 'Mission'),
        ('AUTRE', 'Autre'),
    ]
    
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('APPROUVE', 'Approuvé'),
        ('REJETE', 'Rejeté'),
    ]
    
    employe = models.ForeignKey(User, on_delete=models.CASCADE, related_name='absences')
    date_debut = models.DateField()
    date_fin = models.DateField()
    type_absence = models.CharField(max_length=20, choices=TYPE_CHOICES)
    motif = models.TextField()
    justificatif = models.FileField(
        upload_to='justificatifs/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'png'])],
        null=True,
        blank=True
    )
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    approuve_par = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='absences_approuvees'
    )
    date_approbation = models.DateTimeField(null=True, blank=True)
    commentaire_rh = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Absence'
        verbose_name_plural = 'Absences'
    
    def __str__(self):
        return f"{self.employe.get_full_name()} - {self.date_debut} à {self.date_fin}"

class Retard(models.Model):
    """Modèle pour gérer les retards"""
    employe = models.ForeignKey(User, on_delete=models.CASCADE, related_name='retards')
    date = models.DateField()
    heure_arrivee_effective = models.TimeField()
    heure_arrivee_prevue = models.TimeField(default='08:00')  # Heure de début standard
    motif = models.TextField(null=True, blank=True)
    justificatif = models.FileField(
        upload_to='justificatifs_retards/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'png'])],
        null=True,
        blank=True
    )
    statut = models.CharField(
        max_length=20, 
        choices=[('EN_ATTENTE', 'En attente'), ('APPROUVE', 'Approuvé'), ('REJETE', 'Rejeté')],
        default='EN_ATTENTE'
    )
    approuve_par = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='retards_approuves'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Retard'
        verbose_name_plural = 'Retards'
    
    def __str__(self):
        return f"{self.employe.get_full_name()} - {self.date}"
    
    @property
    def duree_retard(self):
        """Calculer la durée du retard en minutes"""
        from datetime import datetime, timedelta
        arrivee_prevue = datetime.combine(self.date, self.heure_arrivee_prevue)
        arrivee_effective = datetime.combine(self.date, self.heure_arrivee_effective)
        if arrivee_effective > arrivee_prevue:
            duree = arrivee_effective - arrivee_prevue
            return duree.total_seconds() / 60
        return 0 