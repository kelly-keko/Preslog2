from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, time

User = get_user_model()

class Presence(models.Model):
    """
    Modèle pour gérer les présences (pointages) des employés
    Un employé peut avoir plusieurs pointages par jour (entrée, sortie, pause)
    """
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='presences')
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True, help_text="Heure d'entrée")
    time_out = models.TimeField(null=True, blank=True, help_text="Heure de sortie")
    is_late = models.BooleanField(default=False, help_text="Si l'employé est arrivé en retard")
    delay_minutes = models.IntegerField(default=0, help_text="Nombre de minutes de retard")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['employee', 'date']
        ordering = ['-date', '-created_at']
        verbose_name = "Présence"
        verbose_name_plural = "Présences"
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date}"
    
    def save(self, *args, **kwargs):
        # Calculer automatiquement si l'employé est en retard
        if self.time_in:
            # Heure normale d'entrée : 8h00
            normal_time = time(8, 0)
            if self.time_in > normal_time:
                self.is_late = True
                # Calculer les minutes de retard
                delay_seconds = (datetime.combine(self.date, self.time_in) - 
                               datetime.combine(self.date, normal_time)).total_seconds()
                self.delay_minutes = int(delay_seconds / 60)
            else:
                self.is_late = False
                self.delay_minutes = 0
        
        super().save(*args, **kwargs)

class Retard(models.Model):
    """
    Modèle pour gérer les retards et leurs justifications
    Un retard est créé automatiquement quand un employé pointe en retard
    """
    STATUS_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('APPROUVEE', 'Approuvée'),
        ('REFUSEE', 'Refusée'),
    ]
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='retards')
    presence = models.ForeignKey(Presence, on_delete=models.CASCADE, related_name='retards')
    date = models.DateField()
    expected_time = models.TimeField(default=time(8, 0), help_text="Heure normale d'entrée")
    actual_time = models.TimeField(help_text="Heure réelle d'entrée")
    delay_minutes = models.IntegerField(help_text="Nombre de minutes de retard")
    justification = models.TextField(null=True, blank=True, help_text="Justification du retard")
    justification_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='EN_ATTENTE'
    )
    justified_at = models.DateTimeField(null=True, blank=True)
    validated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='retards_validated'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = "Retard"
        verbose_name_plural = "Retards"
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date} ({self.delay_minutes}min)"
    
    def save(self, *args, **kwargs):
        # Si c'est la première fois qu'on sauvegarde et qu'il y a une justification
        if not self.pk and self.justification:
            self.justified_at = timezone.now()
        super().save(*args, **kwargs)

class Absence(models.Model):
    """
    Modèle pour gérer les absences (employés qui n'ont pas pointé)
    Une absence est créée automatiquement pour les employés qui n'ont pas pointé
    """
    STATUS_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('APPROUVEE', 'Approuvée'),
        ('REFUSEE', 'Refusée'),
    ]
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='absences')
    date = models.DateField()
    justification = models.TextField(null=True, blank=True, help_text="Justification de l'absence")
    justification_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='EN_ATTENTE'
    )
    justified_at = models.DateTimeField(null=True, blank=True)
    validated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='absences_validated'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['employee', 'date']
        ordering = ['-date', '-created_at']
        verbose_name = "Absence"
        verbose_name_plural = "Absences"
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date}"
    
    def save(self, *args, **kwargs):
        # Si c'est la première fois qu'on sauvegarde et qu'il y a une justification
        if not self.pk and self.justification:
            self.justified_at = timezone.now()
        super().save(*args, **kwargs)

class BiometricLog(models.Model):
    """
    Modèle pour stocker les logs du dispositif biométrique
    Ces logs sont reçus via l'API du dispositif de pointage
    """
    LOG_TYPES = [
        ('ENTREE', 'Entrée'),
        ('SORTIE', 'Sortie'),
        ('PAUSE', 'Pause'),
        ('REPRISE', 'Reprise de pause'),
    ]
    
    biometric_id = models.CharField(max_length=50, help_text="ID biométrique de l'employé")
    log_type = models.CharField(max_length=20, choices=LOG_TYPES, help_text="Type de pointage")
    timestamp = models.DateTimeField(help_text="Horodatage du pointage")
    device_id = models.CharField(max_length=50, help_text="ID du dispositif")
    raw_data = models.JSONField(default=dict, help_text="Données brutes du dispositif")
    processed = models.BooleanField(default=False, help_text="Si les données ont été traitées")
    employee = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='biometric_logs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Log biométrique"
        verbose_name_plural = "Logs biométriques"
    
    def __str__(self):
        return f"{self.biometric_id} - {self.log_type} - {self.timestamp}"
    
    def process_log(self):
        """
        Traiter le log biométrique et créer/mettre à jour la présence
        """
        try:
            # Trouver l'employé par son ID biométrique
            employee = User.objects.get(biometric_id=self.biometric_id, is_active=True)
            self.employee = employee
            
            # Créer ou récupérer la présence pour cette date
            presence, created = Presence.objects.get_or_create(
                employee=employee,
                date=self.timestamp.date(),
                defaults={}
            )
            
            # Mettre à jour les heures selon le type de log
            if self.log_type == 'ENTREE':
                presence.time_in = self.timestamp.time()
                # Créer un retard si nécessaire
                if presence.is_late and presence.delay_minutes > 0:
                    Retard.objects.get_or_create(
                        employee=employee,
                        presence=presence,
                        date=self.timestamp.date(),
                        defaults={
                            'actual_time': self.timestamp.time(),
                            'delay_minutes': presence.delay_minutes
                        }
                    )
            
            elif self.log_type == 'SORTIE':
                presence.time_out = self.timestamp.time()
            
            presence.save()
            self.processed = True
            self.save()
            
            return True
            
        except User.DoesNotExist:
            # Employé non trouvé avec cet ID biométrique
            self.processed = True
            self.save()
            return False
        except Exception as e:
            # Erreur lors du traitement
            print(f"Erreur lors du traitement du log biométrique: {e}")
            return False 