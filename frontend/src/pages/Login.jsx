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
      navigate('/')
    } else {
      toast.error(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Branding SECEL et message d'accueil */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl overflow-hidden border-4 border-white">
            <img src={logo} alt="Logo SECEL Preslog" className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-blue-900 tracking-tight drop-shadow">
            Bienvenue sur la plateforme RH SECEL
          </h2>
          <p className="mt-2 text-sm text-blue-700">Connectez-vous pour accéder à votre espace</p>
        </div>
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-blue-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-blue-700">
                Nom d'utilisateur
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="Entrez votre nom d'utilisateur"
                />
                <span className="absolute right-3 top-2 text-blue-300">
                  <Building2 className="h-5 w-5" />
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-700">
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
                  className="input-field pr-10 rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
        <div className="text-center">
          <p className="text-xs text-blue-500">
            © 2025 SECEL SARL. Plateforme RH développée pour la gestion interne.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login