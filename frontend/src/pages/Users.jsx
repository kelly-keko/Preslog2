import { useState, useEffect } from 'react'
import { UserPlus, Edit, ArchiveRestore, Archive, X, Search, User } from 'lucide-react'
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
  // Ajout pour loader sur action
  const [actionLoadingId, setActionLoadingId] = useState(null)
  // Ajout pour la recherche/filter
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

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
      toast.error(error.response?.data?.detail || "Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour archiver/réactiver un utilisateur avec confirmation
  const toggleArchive = async (id) => {
    const user = users.find(u => u.id === id)
    const confirmMsg = user.is_active ? 'Archiver cet utilisateur ?' : 'Réactiver cet utilisateur ?'
    if (!window.confirm(confirmMsg)) return
    setActionLoadingId(id)
    try {
      await api.patch(`/api/users/${id}/`, { is_active: !user.is_active })
      toast.success(user.is_active ? 'Utilisateur archivé' : 'Utilisateur réactivé')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la modification du statut")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Fonction pour modifier le rôle (loader sur bouton)
  const handleRoleChange = async (id, newRole) => {
    setActionLoadingId(id)
    try {
      await api.patch(`/api/users/${id}/`, { role: newRole })
      toast.success('Rôle modifié')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du changement de rôle")
    } finally {
      setActionLoadingId(null)
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
        password_confirm: form.password_confirm, // Ajouter la confirmation du mot de passe
        is_active: true // Ajouté pour que l'utilisateur soit actif par défaut
      })
      toast.success('Utilisateur créé avec succès')
      setShowAddModal(false)
      setForm({ first_name: '', last_name: '', email: '', role: 'EMPLOYE', password: '', password_confirm: '' })
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.detail || Object.values(error.response?.data || {})[0] || "Erreur lors de la création de l'utilisateur")
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
      toast.error(error.response?.data?.detail || Object.values(error.response?.data || {})[0] || "Erreur lors de la modification de l'utilisateur")
    } finally {
      setFormLoading(false)
    }
  }

  // Filtrage et recherche utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !filterRole || user.role === filterRole
    const matchesStatus = !filterStatus || (filterStatus === 'actif' ? user.is_active : !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  // Log la structure des users après chaque action
  console.log('USERS:', users)

  // Calculs pour le résumé
  const totalUsers = users.length
  const totalActive = users.filter(u => u.is_active).length
  const totalArchived = users.filter(u => !u.is_active).length

  if (loading) {
    // Afficher un spinner pendant le chargement
    return <LoadingSpinner text="Chargement des utilisateurs..." />
  }

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 md:px-8 bg-gray-50 min-h-screen">
      {/* Résumé */}
      <div className="flex flex-wrap gap-4 mb-6 border-b pb-4">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <User className="w-5 h-5 text-blue-500" /> {totalUsers} utilisateurs
        </div>
        <div className="flex items-center gap-2 text-md text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> {totalActive} actifs
        </div>
        <div className="flex items-center gap-2 text-md text-gray-500">
          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> {totalArchived} archivés
        </div>
      </div>
      {/* Titre, recherche et bouton d'ajout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex-1 flex flex-col md:flex-row gap-2 items-start md:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <div className="flex gap-2 items-center ml-0 md:ml-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-8 pr-2 py-1 w-48"
              />
              <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
            </div>
            <select
              className="input-field py-1"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="">Tous rôles</option>
              <option value="EMPLOYE">Employé</option>
              <option value="RH">RH</option>
              <option value="DG">DG</option>
            </select>
            <select
              className="input-field py-1"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="actif">Actif</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
        </div>
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
      <div className="overflow-x-auto bg-white rounded-lg shadow" style={{ minWidth: '100%', maxWidth: '100%' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">Utilisateur</th>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">Rôle</th>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">Statut</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredUsers.map((user, idx) => (
              <tr
                key={user.id}
                className={user.is_active ? (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50') : 'bg-gray-100'}
                style={{ fontSize: '1.12rem', lineHeight: '2.4rem', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#e0e7ef'}
                onMouseOut={e => e.currentTarget.style.background = user.is_active ? (idx % 2 === 0 ? '#fff' : '#f9fafb') : '#f3f4f6'}
              >
                <td className="px-8 py-4 whitespace-nowrap font-semibold text-gray-900 text-lg flex items-center gap-3">
                  {/* Avatar/initiale */}
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-200 text-blue-800 font-bold text-xl">
                    {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                  </span>
                  <span>{user.first_name} {user.last_name}</span>
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-gray-700 text-base">{user.email}</td>
                <td className="px-8 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-4 py-1 rounded text-base font-bold mr-2
                    ${user.role === 'EMPLOYE' ? 'bg-blue-100 text-blue-800' : user.role === 'RH' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>{user.role}</span>
                  <select
                    className="border rounded px-3 py-1 text-base"
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={actionLoadingId === user.id}
                  >
                    <option value="EMPLOYE">Employé</option>
                    <option value="RH">RH</option>
                    <option value="DG">DG</option>
                  </select>
                </td>
                <td className="px-8 py-4 whitespace-nowrap">
                  {user.is_active ? (
                    <span className="inline-flex items-center px-4 py-1 rounded text-base font-bold bg-green-100 text-green-800">Actif</span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-1 rounded text-base font-bold bg-gray-200 text-gray-600">Archivé</span>
                  )}
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-right text-base font-medium flex gap-2 justify-end">
                  <button
                    className="btn-secondary flex items-center gap-2 hover:bg-blue-100 transition px-4 py-2 text-base"
                    title={user.is_active ? 'Archiver' : 'Réactiver'}
                    onClick={() => toggleArchive(user.id)}
                    disabled={actionLoadingId === user.id}
                  >
                    {actionLoadingId === user.id ? (
                      <span className="loader w-4 h-4" />
                    ) : user.is_active ? <Archive className="w-5 h-5" /> : <ArchiveRestore className="w-5 h-5" />}
                    {user.is_active ? 'Archiver' : 'Réactiver'}
                  </button>
                  <button className="btn-secondary flex items-center gap-2 hover:bg-yellow-100 transition px-4 py-2 text-base" title="Modifier" onClick={() => openEditModal(user)}>
                    <Edit className="w-5 h-5" /> Modifier
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