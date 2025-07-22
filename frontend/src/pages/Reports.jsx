import { BarChart3, FileText, Download } from 'lucide-react'

export default function Reports() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-secel-600" />
        <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>
      </div>
      <p className="text-gray-600 max-w-2xl">
        Retrouvez ici les rapports d’assiduité, les exports PDF/Excel, et les statistiques globales de présence, d’absences et de retards pour l’entreprise.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card flex flex-col items-center justify-center">
          <FileText className="h-10 w-10 text-secel-600 mb-2" />
          <h2 className="text-lg font-semibold mb-1">Exporter les présences</h2>
          <button className="btn-primary flex items-center gap-2 mt-2" disabled>
            <Download className="h-4 w-4" />
            Exporter (à venir)
          </button>
        </div>
        <div className="card flex flex-col items-center justify-center">
          <FileText className="h-10 w-10 text-secel-600 mb-2" />
          <h2 className="text-lg font-semibold mb-1">Exporter les absences</h2>
          <button className="btn-primary flex items-center gap-2 mt-2" disabled>
            <Download className="h-4 w-4" />
            Exporter (à venir)
          </button>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-lg font-semibold mb-4">Statistiques globales (exemple)</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Taux de présence moyen : <span className="font-bold text-secel-600">92%</span></li>
          <li>• Absences ce mois : <span className="font-bold text-yellow-600">4</span></li>
          <li>• Retards ce mois : <span className="font-bold text-red-600">2</span></li>
        </ul>
        <p className="text-xs text-gray-400 mt-4">(Les exports et graphiques avancés seront disponibles dans une prochaine version.)</p>
      </div>
    </div>
  )
} 