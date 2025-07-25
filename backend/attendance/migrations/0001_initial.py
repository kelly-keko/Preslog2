# Generated by Django 4.1.13 on 2025-07-19 18:57

import datetime
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Presence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('time_in', models.TimeField(blank=True, help_text="Heure d'entrée", null=True)),
                ('time_out', models.TimeField(blank=True, help_text='Heure de sortie', null=True)),
                ('is_late', models.BooleanField(default=False, help_text="Si l'employé est arrivé en retard")),
                ('delay_minutes', models.IntegerField(default=0, help_text='Nombre de minutes de retard')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='presences', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Présence',
                'verbose_name_plural': 'Présences',
                'ordering': ['-date', '-created_at'],
                'unique_together': {('employee', 'date')},
            },
        ),
        migrations.CreateModel(
            name='Retard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('expected_time', models.TimeField(default=datetime.time(8, 0), help_text="Heure normale d'entrée")),
                ('actual_time', models.TimeField(help_text="Heure réelle d'entrée")),
                ('delay_minutes', models.IntegerField(help_text='Nombre de minutes de retard')),
                ('justification', models.TextField(blank=True, help_text='Justification du retard', null=True)),
                ('justification_status', models.CharField(choices=[('EN_ATTENTE', 'En attente'), ('APPROUVEE', 'Approuvée'), ('REFUSEE', 'Refusée')], default='EN_ATTENTE', max_length=20)),
                ('justified_at', models.DateTimeField(blank=True, null=True)),
                ('validated_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='retards', to=settings.AUTH_USER_MODEL)),
                ('presence', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='retards', to='attendance.presence')),
                ('validated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='retards_validated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Retard',
                'verbose_name_plural': 'Retards',
                'ordering': ['-date', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='BiometricLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('biometric_id', models.CharField(help_text="ID biométrique de l'employé", max_length=50)),
                ('log_type', models.CharField(choices=[('ENTREE', 'Entrée'), ('SORTIE', 'Sortie'), ('PAUSE', 'Pause'), ('REPRISE', 'Reprise de pause')], help_text='Type de pointage', max_length=20)),
                ('timestamp', models.DateTimeField(help_text='Horodatage du pointage')),
                ('device_id', models.CharField(help_text='ID du dispositif', max_length=50)),
                ('raw_data', models.JSONField(default=dict, help_text='Données brutes du dispositif')),
                ('processed', models.BooleanField(default=False, help_text='Si les données ont été traitées')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('employee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='biometric_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Log biométrique',
                'verbose_name_plural': 'Logs biométriques',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='Absence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('justification', models.TextField(blank=True, help_text="Justification de l'absence", null=True)),
                ('justification_status', models.CharField(choices=[('EN_ATTENTE', 'En attente'), ('APPROUVEE', 'Approuvée'), ('REFUSEE', 'Refusée')], default='EN_ATTENTE', max_length=20)),
                ('justified_at', models.DateTimeField(blank=True, null=True)),
                ('validated_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='absences', to=settings.AUTH_USER_MODEL)),
                ('validated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='absences_validated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Absence',
                'verbose_name_plural': 'Absences',
                'ordering': ['-date', '-created_at'],
                'unique_together': {('employee', 'date')},
            },
        ),
    ]
