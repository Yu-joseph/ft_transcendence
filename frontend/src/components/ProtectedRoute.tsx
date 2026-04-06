<<<<<<< HEAD
<<<<<<< HEAD
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
=======
import { useAuth } from '@clerk/clerk-react'
=======
>>>>>>> fa260b3 (merging AI service with docker and nginx)
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

<<<<<<< HEAD
  if (!isSignedIn) 
>>>>>>> 2d98fb0 (SA)
=======
  if (!user) 
>>>>>>> dd5f97c (merging current changes with all team members)
    return <Navigate to="/" replace />

  return <>{children}</>
}
