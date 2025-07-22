import { useState, useEffect } from 'react'
import { UserPlus, Edit, ArchiveRestore, Archive, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Users() {
  const { isRH } = useAuth()
  // État local pour la liste des utilisateurs
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  // État pour la modale d'ajout
  const [showAddModal, setShowAddModal] = useState(false)
  // État pour la modale de modification
  const [showEditModal, setShowEditModal] = useState(false)
  // Utilisateur sélectionné pour modification
  const [selectedUser, setSelectedUser] = useState(null)
  // État pour le formulaire d'ajout
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'EMPLOYE',
    password: '',
    password_confirm: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  // Vérifier l'autorisation d'accès
  if (!isRH) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  // Charger la liste des utilisateurs depuis l'API au chargement du composant
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fonction pour charger les utilisateurs
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/users/')
      setUsers(res.data.results || res.data) // selon pagination DRF
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour archiver/réactiver un utilisateur
  const toggleArchive = async (id) => {
    const user = users.find(u => u.id === id)
    try {
      await api.patch(`/api/users/${id}/`, { is_active: !user.is_active })
      toast.success(user.is_active ? 'Utilisateur archivé' : 'Utilisateur réactivé')
      fetchUsers()
    } catch (error) {
      toast.error("Erreur lors de la modification du statut")
    }
  }

  // Fonction pour modifier le rôle
  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/api/users/${id}/`, { role: newRole })
      toast.success('Rôle modifié')
      fetchUsers()
    } catch (error) {
      toast.error("Erreur lors du changement de rôle")
    }
  }

  // Gestion du formulaire d'ajout/modification
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Ouvrir la modale d'ajout
  const openAddModal = () => {
    setForm({ first_name: '', last_name: '', email: '', role: 'EMPLOYE', password: '', password_confirm: '' })
    setShowAddModal(true)
  }

  // Ouvrir la modale de modification avec pré-remplissage
  const openEditModal = (user) => {
    setSelectedUser(user)
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || 'EMPLOYE',
      password: '',
      password_confirm: ''
    })
    setShowEditModal(true)
  }

  // Soumission du formulaire d'ajout
  const handleAddUser = async (e) => {
    e.preventDefault()
    // Validation de base
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.password_confirm) {
      toast.error('Tous les champs sont obligatoires')
      return
    }
    if (form.password !== form.password_confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setFormLoading(true)
    try {
      await api.post('/api/users/', {
        username: form.email, // Utiliser l'email comme nom d'utilisateur
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: form.role,
        password: form.password,
        password_confirm: form.password_confirm // Ajouter la confirmation du mot de passe
      })
      toast.success('Utilisateur créé avec succès')
      setShowAddModal(false)
      setForm({ first_name: '', last_name: '', email: '', role: 'EMPLOYE', password: '', password_confirm: '' })
      fetchUsers()
    } catch (error) {
      toast.error("Erreur lors de la création de l'utilisateur")
    } finally {
      setFormLoading(false)
    }
  }

  // Soumission du formulaire de modification
  const handleEditUser = async (e) => {
    e.preventDefault()
    // Validation de base
    if (!form.first_name || !form.last_name || !form.email) {
      toast.error('Tous les champs sont obligatoires')
      return
    }
    if (form.password && form.password !== form.password_confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setFormLoading(true)
    try {
      // Préparer les données à envoyer (ne pas envoyer password si vide)
      const data = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: form.role
      }
      if (form.password) {
        data.password = form.password
      }
      await api.patch(`/api/users/${selectedUser.id}/`, data)
      toast.success('Utilisateur modifié avec succès')
      setShowEditModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      toast.error("Erreur lors de la modification de l'utilisateur")
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    // Afficher un spinner pendant le chargement
    return <LoadingSpinner text="Chargement des utilisateurs..." />
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Titre et bouton d'ajout */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAddModal}>
          <UserPlus className="w-5 h-5" />
          Ajouter un employé
        </button>
      </div>

      {/* Modale d'ajout d'utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            {/* Bouton de fermeture */}
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowAddModal(false)}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Ajouter un employé</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleFormChange} className="input-field" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleFormChange} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rôle *</label>
                <select name="role" value={form.role} onChange={handleFormChange} className="input-field" required>
                  <option value="EMPLOYE">Employé</option>
                  <option value="RH">RH</option>
                  <option value="DG">DG</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                  <input type="password" name="password" value={form.password} onChange={handleFormChange} className="input-field" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Confirmation *</label>
                  <input type="password" name="password_confirm" value={form.password_confirm} onChange={handleFormChange} className="input-field" required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={formLoading}>
                {formLoading ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modale de modification d'utilisateur */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            {/* Bouton de fermeture */}
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowEditModal(false)}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Modifier l'utilisateur</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleFormChange} className="input-field" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleFormChange} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rôle *</label>
                <select name="role" value={form.role} onChange={handleFormChange} className="input-field" required>
                  <option value="EMPLOYE">Employé</option>
                  <option value="RH">RH</option>
                  <option value="DG">DG</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                  <input type="password" name="password" value={form.password} onChange={handleFormChange} className="input-field" placeholder="Laisser vide pour ne pas changer" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Confirmation</label>
                  <input type="password" name="password_confirm" value={form.password_confirm} onChange={handleFormChange} className="input-field" placeholder="Laisser vide pour ne pas changer" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={formLoading}>
                {formLoading ? 'Modification...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className={user.is_active ? '' : 'bg-gray-100'}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Sélecteur de rôle, modifiable uniquement si RH ou DG */}
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="EMPLOYE">Employé</option>
                    <option value="RH">RH</option>
                    <option value="DG">DG</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_active ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Actif</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">Archivé</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                  {/* Bouton archiver/réactiver */}
                  <button
                    className="btn-secondary flex items-center gap-1"
                    title={user.is_active ? 'Archiver' : 'Réactiver'}
                    onClick={() => toggleArchive(user.id)}
                  >
                    {user.is_active ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                    {user.is_active ? 'Archiver' : 'Réactiver'}
                  </button>
                  {/* Bouton modifier */}
                  <button className="btn-secondary flex items-center gap-1" title="Modifier" onClick={() => openEditModal(user)}>
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commentaires explicatifs */}
      {/*
        - Ce composant affiche la liste des utilisateurs avec leurs rôles et statuts.
        - Les actions (archiver, réactiver, modifier le rôle) sont connectées à l'API.
        - Le bouton "Ajouter un employé" ouvre une modale avec un formulaire de création.
        - Le bouton "Modifier" ouvre une modale de modification pré-remplie.
      */}
    </div>
  )
}

export default Users 