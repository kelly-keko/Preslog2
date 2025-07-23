import { useState, useEffect } from 'react'
import { 
  Clock, 
  Download,
  Calendar
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Presences() {
  const { user } = useAuth()
  const [presences, setPresences] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Charger les données au montage du composant
  useEffect(() => {
    fetchPresences()
  }, [dateFrom, dateTo])

  // Fonction pour charger les présences de l'employé connecté
  const fetchPresences = async () => {
    setLoading(true)
    try {
      let url = '/api/attendance/presences/'
      const params = new URLSearchParams()
      
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await api.get(url)
      setPresences(response.data.results || response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des présences:', error)
      toast.error("Erreur lors du chargement des présences")
    } finally {
      setLoading(false)
    }
  }

  // Fonctions pour le style et le texte des statuts (gardées pour la clarté)
  const getStatusColor = (status) => {
    switch (status) {
      case 'ABSENT': return 'text-red-600 bg-red-100'
      case 'EN_COURS': return 'text-yellow-600 bg-yellow-100'
      case 'TERMINE': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ABSENT': return 'Absent'
      case 'EN_COURS': return 'En cours'
      case 'TERMINE': return 'Terminé'
      default: return 'Inconnu'
    }
  }

  // Fonction pour exporter les données (Excel)
  const handleExportExcel = async () => {
    try {
      let url = '/api/attendance/presences/export-excel/'
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      const response = await api.get(url, { responseType: 'blob' })
      const urlBlob = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
      const link = document.createElement('a')
      link.href = urlBlob
      link.setAttribute('download', 'presences.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error("Erreur lors de l'export Excel")
    }
  }

  if (loading) {
    return <LoadingSpinner text="Chargement de votre historique..." />
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon historique de présence</h1>
          <p className="mt-1 text-sm text-gray-500">
            Consultez ici vos pointages et heures de travail.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres par date */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Tableau de l'historique des présences */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Heure entrée</th>
                <th className="table-header">Heure sortie</th>
                <th className="table-header">Retard</th>
                <th className="table-header">Total heures</th>
                <th className="table-header">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {presences.map((presence) => (
                <tr key={presence.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {presence.date_display}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900 font-medium">
                      {presence.time_in_display}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900 font-medium">
                      {presence.time_out_display}
                    </div>
                  </td>
                  <td className="table-cell">
                    {presence.is_late ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-red-600 bg-red-100">
                        {presence.delay_minutes} min
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900 font-medium">
                      {presence.total_hours}h
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(presence.status)}`}>
                      {getStatusText(presence.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {presences.length === 0 && (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucune présence trouvée
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucune présence ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Presences 