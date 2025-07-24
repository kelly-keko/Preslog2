import React, { useEffect, useState } from 'react'
import axios from 'axios'

function AbsencesEmploye() {
  const [absences, setAbsences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentAbs, setCurrentAbs] = useState(null)
  const [justification, setJustification] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justificationFile, setJustificationFile] = useState(null)

  useEffect(() => {
    axios.get('/api/attendance/mes-absences/')
      .then(res => {
        setAbsences(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleJustify = (abs) => {
    setCurrentAbs(abs)
    setJustification('')
    setShowForm(true)
  }

  const submitJustification = async () => {
    if (!currentAbs) return
    setSubmitting(true)
    try {
      const formData = new FormData();
      formData.append('justification', justification);
      if (justificationFile) {
        formData.append('justification_file', justificationFile);
      }
      if (currentAbs.type === 'RETARD') {
        await axios.patch(`/api/attendance/retards/${currentAbs.id}/justify/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await axios.patch(`/api/attendance/absences/${currentAbs.id}/justify/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      // Refresh list
      const res = await axios.get('/api/attendance/mes-absences/')
      setAbsences(res.data)
      setShowForm(false)
      setJustificationFile(null)
    } catch (e) {
      alert("Erreur lors de la justification")
    }
    setSubmitting(false)
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Mes Absences & Retards</h1>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Justification / Retard</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {absences.map(abs => (
            <tr key={abs.id} className="border-t">
              <td className="px-4 py-2">{abs.date}</td>
              <td className="px-4 py-2">{abs.type === 'RETARD' ? 'Retard' : 'Absence'}</td>
              <td className="px-4 py-2">
                {abs.type === 'RETARD'
                  ? `${abs.delay_minutes || 0} min`
                  : abs.justification || '-'}
              </td>
              <td className="px-4 py-2">
                {abs.justification_status || '-'}
              </td>
              <td className="px-4 py-2">
                {abs.justification_status === 'EN_ATTENTE' && (
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleJustify(abs)}
                  >
                    Justifier
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulaire de justification */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              Justifier {currentAbs.type === 'RETARD' ? 'le retard' : "l'absence"} du {currentAbs.date}
            </h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={4}
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Votre justification..."
            />
            <input
              type="file"
              className="mb-4"
              onChange={e => setJustificationFile(e.target.files[0])}
              accept="application/pdf,image/*"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={submitJustification}
                disabled={submitting || !justification}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AbsencesEmploye