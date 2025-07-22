import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Presences from './pages/Presences'
import Absences from './pages/Absences'
import Retards from './pages/Retards'
import Users from './pages/Users'
import Rapports from './pages/Rapports'
import Historique from './pages/Historique' // Importer la nouvelle page
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="presences" element={<Presences />} />
        <Route path="absences" element={<Absences />} />
        <Route path="retards" element={<Retards />} />
        <Route path="historique" element={<Historique />} /> {/* Ajouter la route */}
        <Route path="reports" element={<Rapports />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App 