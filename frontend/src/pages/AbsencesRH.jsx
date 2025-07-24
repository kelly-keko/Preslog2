import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, FileText } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

function AbsencesRH() {
  const [absences, setAbsences] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  useEffect(() => {
    fetchAbsences()
  }, [])

  const fetchAbsences = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/attendance/absences-rh/')
      setAbsences(res.data)
    } catch (error) {
      toast.error("Erreur lors du chargement des absences")
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (id, status) => {
    setActionLoadingId(id)
    try {
      await api.post(`/api/attendance/valider-absence/${id}/`, { status })
      toast.success(status === 'VALIDE' ? 'Justification validée' : 'Justification refusée')
      fetchAbsences()
    } catch (error) {
      toast.error("Erreur lors de la validation")
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Absences & Retards à valider</h1>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Employé</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Justification</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {absences.map(abs => (
            <tr key={abs.id} className="border-t">
              <td className="px-4 py-2">{abs.user_first_name} {abs.user_last_name}</td>
              <td className="px-4 py-2">{abs.date}</td>
              <td className="px-4 py-2">{abs.type === 'RETARD' ? 'Retard' : 'Absence'}</td>
              <td className="px-4 py-2">{abs.justification || <span className="text-gray-400">Non justifiée</span>}
                {abs.justification_file && (
                  <a
                    href={abs.justification_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 underline"
                  >
                    Voir justificatif
                  </a>
                )}
              </td>
              <td className="px-4 py-2">
                {abs.justification_status === 'APPROUVEE' ? (
                  <span className="inline-flex items-center text-green-700"><CheckCircle className="w-4 h-4 mr-1" />Approuvée</span>
                ) : abs.justification_status === 'REFUSEE' ? (
                  <span className="inline-flex items-center text-red-700"><XCircle className="w-4 h-4 mr-1" />Refusée</span>
                ) : (
                  <span className="inline-flex items-center text-yellow-700"><FileText className="w-4 h-4 mr-1" />En attente</span>
                )}
              </td>
              <td className="px-4 py-2">
                {abs.justification_status === 'EN_ATTENTE' && abs.justification && (
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      disabled={actionLoadingId === abs.id}
                      onClick={() => handleValidation(abs.id, 'VALIDE')}
                    >
                      {actionLoadingId === abs.id ? '...' : 'Valider'}
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      disabled={actionLoadingId === abs.id}
                      onClick={() => handleValidation(abs.id, 'REFUSE')}
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AbsencesRH