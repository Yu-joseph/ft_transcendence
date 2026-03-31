import { Navigate } from 'react-router-dom'
import { useCustomAuth } from '../hooks/useCustomAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useCustomAuth()

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Checking session...
      </div>
    )

  // Using `replace` prevents navigating back to protected pages after redirect.

  if (!isSignedIn) 
    return <Navigate to="/" replace />

  return <>{children}</>
}
