import { useState } from 'react'
import Presences from './Presences'
import Absences from './Absences'
import Retards from './Retards'

function Historique() {
  const [activeTab, setActiveTab] = useState('presences')

  const tabs = [
    { id: 'presences', label: 'Présences' },
    { id: 'absences', label: 'Absences' },
    { id: 'retards', label: 'Retards' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon historique</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consultez ici l'historique de vos présences, absences et retards.
        </p>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-secel-500 text-secel-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div>
        {activeTab === 'presences' && <Presences />}
        {activeTab === 'absences' && <Absences />}
        {activeTab === 'retards' && <Retards />}
      </div>
    </div>
  )
}

export default Historique 