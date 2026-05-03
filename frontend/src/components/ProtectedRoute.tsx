import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  // Intra flow: block navigation until the intra user sets a password.
  const intraPasswordRequired = localStorage.getItem('intra_password_required') === '1'
  // Allow both route variants used by the backend and frontend.
  const isIntraPasswordRoute = location.pathname === '/changeps' || location.pathname === '/ChangeIntra'

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Checking session...
      </div>
    )

  // Using `replace` prevents navigating back to protected pages after redirect.

  if (!user) {
    const redirectTo = isIntraPasswordRoute ? '/login' : '/'
    return <Navigate to={redirectTo} replace />
  }

  // Keep intra users on the password page until they complete setup.
  if (intraPasswordRequired && !isIntraPasswordRoute)
    return <Navigate to="/changeps" replace />

  return <>{children}</>
}