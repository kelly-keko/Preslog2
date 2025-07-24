import { useEffect, useState } from 'react'
import { Users, AlertCircle, Clock, TrendingUp } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 drop-shadow mb-2">Tableau de bord RH</h1>
          <p className="text-lg text-blue-700">Vue synthétique des présences, absences et retards de l'entreprise.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 flex items-center hover:scale-[1.03] transition">
            <div className="flex-shrink-0 p-4 rounded-xl bg-blue-500 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="ml-6 flex-1">
              <div className="text-sm font-medium text-blue-700">Employés actifs</div>
              <div className="text-3xl font-bold text-blue-900">{data.total_employees}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 p-6 flex items-center hover:scale-[1.03] transition">
            <div className="flex-shrink-0 p-4 rounded-xl bg-yellow-500 shadow-lg">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <div className="ml-6 flex-1">
              <div className="text-sm font-medium text-yellow-700">Absences à valider</div>
              <div className="text-3xl font-bold text-yellow-600">{data.absences_en_attente}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 flex items-center hover:scale-[1.03] transition">
            <div className="flex-shrink-0 p-4 rounded-xl bg-red-500 shadow-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div className="ml-6 flex-1">
              <div className="text-sm font-medium text-red-700">Retards à valider</div>
              <div className="text-3xl font-bold text-red-600">{data.retards_en_attente}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex items-center hover:scale-[1.03] transition">
            <div className="flex-shrink-0 p-4 rounded-xl bg-green-500 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="ml-6 flex-1">
              <div className="text-sm font-medium text-green-700">Heures moy./jour</div>
              <div className="text-3xl font-bold text-green-600">{stats.avg_hours_per_day || 0}h</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 text-center hover:scale-[1.03] transition">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Présences (30j)</h3>
            <div className="text-4xl font-extrabold text-blue-600">{stats.total_presences || 0}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 p-6 text-center hover:scale-[1.03] transition">
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Absences (30j)</h3>
            <div className="text-4xl font-extrabold text-yellow-600">{stats.total_absences || 0}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 text-center hover:scale-[1.03] transition">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Retards (30j)</h3>
            <div className="text-4xl font-extrabold text-red-600">{stats.total_retards || 0}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardRH