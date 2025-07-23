import { useEffect, useState } from 'react'
import { Users, AlertCircle, Clock, TrendingUp, FileText } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function DashboardRH() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/attendance/presences/rh-dashboard/')
      setData(response.data)
    } catch (error) {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Chargement du tableau de bord RH..." />
  }
  if (!data) {
    return <div className="text-red-600">Erreur lors du chargement des données RH.</div>
  }
  const stats = data.statistics || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord RH</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue synthétique des présences, absences et retards de l'entreprise.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Employés actifs</dt>
                <dd className="text-2xl font-semibold text-gray-900">{data.total_employees}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-500">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Absences à valider</dt>
                <dd className="text-2xl font-semibold text-gray-900">{data.absences_en_attente}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-red-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Retards à valider</dt>
                <dd className="text-2xl font-semibold text-gray-900">{data.retards_en_attente}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Heures moy./jour</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.avg_hours_per_day || 0}h</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Présences (30j)</h3>
          <div className="text-3xl font-bold text-blue-600">{stats.total_presences || 0}</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Absences (30j)</h3>
          <div className="text-3xl font-bold text-yellow-600">{stats.total_absences || 0}</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Retards (30j)</h3>
          <div className="text-3xl font-bold text-red-600">{stats.total_retards || 0}</div>
        </div>
      </div>
    </div>
  )
}

export default DashboardRH 