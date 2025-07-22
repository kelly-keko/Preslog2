import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // Gestion du changement de champ
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData)
    
    if (result.success) {
      toast.success('Connexion réussie !')
      // Redirection selon le rôle (RH, Employé, DG)
      // (La logique de redirection peut être affinée dans le contexte Auth)
      navigate('/')
    } else {
      toast.error(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secel-50 to-secel-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Branding SECEL et message d'accueil */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-secel-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            {/* Logo de l'application */}
            <img src={logo} alt="Logo SECEL Preslog" className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
            Bienvenue sur la plateforme RH SECEL
          </h2>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-secel-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer personnalisé */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2025 SECEL SARL. Plateforme RH développée pour la gestion interne.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 