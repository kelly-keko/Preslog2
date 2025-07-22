import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay, format } from 'date-fns'
import fr from 'date-fns/locale/fr'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Calculer les jours ouvrables du mois courant (lundi à samedi)
  const today = new Date()
  const firstDay = startOfMonth(today)
  const lastDay = endOfMonth(today)
  const allMonthDays = eachDayOfInterval({ start: firstDay, end: lastDay })
  // Liste des jours fériés (à personnaliser si besoin)
  const joursFeries = [] // Ex: ['2024-05-01', '2024-05-20']
  const workingDays = allMonthDays.filter(day => {
    const dayNum = getDay(day)
    const isHoliday = joursFeries.includes(format(day, 'yyyy-MM-dd'))
    // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    return dayNum !== 0 && !isHoliday
  })
  const totalWorkingDays = workingDays.length

  // Récupérer les données du tableau de bord
  const fetchDashboardData = async () => {
    try {
      // Endpoint pour les statistiques personnelles
      const response = await api.get('/api/attendance/presences/statistics/')
      setStats(response.data.statistics || {})
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Chargement de votre tableau de bord..." />
  }

  // Adapter les intitulés
  const statCards = [
    {
      name: `Présences (${totalWorkingDays} jours ouvrables)` ,
      value: stats?.total_presences || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Absences',
      value: stats?.total_absences || 0,
      icon: Calendar,
      color: 'bg-yellow-500'
    },
    {
      name: 'Retards',
      value: stats?.total_retards || 0,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      name: 'Heures moy./jour',
      value: `${stats?.avg_hours_per_day || 0}h`,
      icon: Clock,
      color: 'bg-green-500'
    }
  ]
  
  // Taux de présence sur le mois courant
  const attendanceRate = totalWorkingDays > 0 ? Math.round((stats?.total_presences || 0) / totalWorkingDays * 100) : 0

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue, {user?.first_name} {user?.last_name}. Voici votre résumé.
        </p>
      </div>

      {/* Cartes de statistiques personnelles */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Taux de présence et actions rapides */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Taux de présence */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Taux de présence du mois courant
          </h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progression</span>
                <span>{attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-secel-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attendanceRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Calculé sur {totalWorkingDays} jours ouvrables (lundi à samedi{joursFeries.length > 0 ? ', hors jours fériés' : ''})
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Raccourcis
          </h3>
          <div className="space-y-3">
            <Link to="/absences" className="w-full btn-secondary text-left flex items-center gap-2">
              <FileText className="w-4 h-4"/> Justifier une absence
            </Link>
            <Link to="/retards" className="w-full btn-secondary text-left flex items-center gap-2">
              <Clock className="w-4 h-4"/> Justifier un retard
            </Link>
          </div>
        </div>
      </div>

      {/* Bloc d'informations */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Comment ça marche ?
        </h3>
        <p className="text-sm text-gray-600">
          Votre présence est enregistrée automatiquement via le dispositif de pointage biométrique. 
          En cas d'absence ou de retard, vous pouvez soumettre une justification en utilisant les raccourcis ci-dessus.
        </p>
      </div>
    </div>
  )
}

export default Dashboard 