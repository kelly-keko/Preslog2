import { useState, useEffect } from 'react'
import { Calendar, Download, Edit } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Absences() {
  const { user } = useAuth()
  const [absences, setAbsences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showJustificationForm, setShowJustificationForm] = useState(false)
  const [selectedAbsence, setSelectedAbsence] = useState(null)
  const [justificationText, setJustificationText] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [justificationFile, setJustificationFile] = useState(null)

  useEffect(() => {
    // Si RH/DG, filtre par défaut sur EN_ATTENTE
    if (user?.role === 'RH' || user?.role === 'DG') {
      setSelectedStatus('EN_ATTENTE')
    }
    fetchAbsences()
  }, [selectedStatus])

  // Charger les absences de l'utilisateur connecté
  const fetchAbsences = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/attendance/absences/')
      // On suppose que l'API renvoie déjà les absences de l'utilisateur connecté
      setAbsences(response.data.results || response.data)
    } catch (error) {
      toast.error("Erreur lors du chargement des absences")
    } finally {
      setLoading(false)
    }
  }

  // Filtrer par statut si besoin
  const filteredAbsences = absences.filter(absence => {
    return !selectedStatus || absence.justification_status === selectedStatus
  })

  // Statut coloré
  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return 'text-yellow-600 bg-yellow-100'
      case 'APPROUVEE': return 'text-green-600 bg-green-100'
      case 'REFUSEE': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  const getStatusText = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente'
      case 'APPROUVEE': return 'Approuvée'
      case 'REFUSEE': return 'Refusée'
      default: return 'Non justifiée'
    }
  }

  // Ouvrir le formulaire de justification
  const openJustificationForm = (absence) => {
    setSelectedAbsence(absence)
    setJustificationText(absence.justification || '')
    setShowJustificationForm(true)
  }

  // Soumission de la justification
  const handleSubmitJustification = async (e) => {
    e.preventDefault()
    if (!justificationText.trim()) {
      toast.error('Veuillez saisir une justification')
      return
    }
    setFormLoading(true)
    try {
      const formData = new FormData()
      formData.append('justification', justificationText)
      if (justificationFile) {
        formData.append('justification_file', justificationFile)
      }
      await api.patch(`/api/attendance/absences/${selectedAbsence.id}/justify/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Justification envoyée avec succès')
      setShowJustificationForm(false)
      setSelectedAbsence(null)
      setJustificationText('')
      setJustificationFile(null)
      fetchAbsences()
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la justification")
    } finally {
      setFormLoading(false)
    }
  }

  // Validation/refus RH
  const handleValidate = async (absence, status) => {
    try {
      await api.patch(`/api/attendance/absences/${absence.id}/validate/`, { status })
      toast.success(status === 'APPROUVEE' ? 'Absence approuvée' : 'Absence refusée')
      fetchAbsences()
    } catch (error) {
      toast.error("Erreur lors de la validation")
    }
  }

  // Export PDF
  const handleExport = async () => {
    try {
      const response = await api.get('/api/attendance/absences/export/', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'absences.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF')
    }
  }

  // Export Excel
  const handleExportExcel = async () => {
    try {
      let url = '/api/attendance/absences/export-excel/'
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
      link.setAttribute('download', 'absences.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error("Erreur lors de l'export Excel")
    }
  }

  if (loading) {
    return <LoadingSpinner text="Chargement de vos absences..." />
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes absences</h1>
          <p className="mt-1 text-sm text-gray-500">
            Historique de vos absences et justifications éventuelles.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtre par statut de justification */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut justification</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="APPROUVEE">Approuvée</option>
              <option value="REFUSEE">Refusée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modal de justification */}
      {showJustificationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Justifier l'absence</h2>
            <p className="text-sm text-gray-600 mb-4">
              Absence du {new Date(selectedAbsence.date).toLocaleDateString('fr-FR')}
            </p>
            <form onSubmit={handleSubmitJustification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Justification *</label>
                <textarea
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="Expliquez la raison de votre absence..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Joindre un fichier justificatif (optionnel)</label>
                <input
                  type="file"
                  onChange={e => setJustificationFile(e.target.files[0])}
                  className="input-field"
                  accept="application/pdf,image/*,.doc,.docx"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Envoi...' : 'Envoyer la justification'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJustificationForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des absences */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Date d'absence</th>
                <th className="table-header">Type</th>
                <th className="table-header">Justification</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAbsences.map((absence) => (
                <tr key={absence.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {new Date(absence.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Non pointage
                    </span>
                  </td>
                  <td className="table-cell">
                    {absence.justification ? (
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={absence.justification}>
                          {absence.justification}
                        </div>
                        {absence.justified_at && (
                          <div className="text-xs text-gray-500">
                            Justifié le {new Date(absence.justified_at).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        {absence.justification_file && (
                          <div className="text-xs mt-1">
                            <a href={absence.justification_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Voir justificatif</a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Aucune justification</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(absence.justification_status)}`}>
                      {getStatusText(absence.justification_status)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      {/* Bouton justifier (pour l'employé concerné ou si pas de justification ou refusée) */}
                      {(!absence.justification || absence.justification_status === 'REFUSEE') && (
                        <button
                          onClick={() => openJustificationForm(absence)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                          title="Justifier l'absence"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {/* Boutons validation RH */}
                      {user?.role === 'RH' || user?.role === 'DG' ? (
                        absence.justification && absence.justification_status === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => handleValidate(absence, 'APPROUVEE')}
                              className="text-green-600 hover:text-green-900 text-sm border border-green-600 rounded px-2 py-1 ml-1"
                            >Valider</button>
                            <button
                              onClick={() => handleValidate(absence, 'REFUSEE')}
                              className="text-red-600 hover:text-red-900 text-sm border border-red-600 rounded px-2 py-1 ml-1"
                            >Refuser</button>
                          </>
                        )
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAbsences.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucune absence trouvée
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucune absence ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Absences 