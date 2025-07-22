from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PresenceViewSet, AbsenceViewSet, RetardViewSet

router = DefaultRouter()
router.register(r'presences', PresenceViewSet)
router.register(r'absences', AbsenceViewSet)
router.register(r'retards', RetardViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 