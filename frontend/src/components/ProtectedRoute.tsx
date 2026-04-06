import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Checking session...
      </div>
    )

  // Using `replace` prevents navigating back to protected pages after redirect.

  if (!user) 
    return <Navigate to="/" replace />

  return <>{children}</>
}