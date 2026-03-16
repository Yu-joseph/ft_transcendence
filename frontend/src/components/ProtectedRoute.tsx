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
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) 
    return null // wait for Clerk to initialise
//when an unauthenticated user tries to access a protected route, 
// using `replace` prevents them from pressing the **back button** to return 
// to the protected page they were never allowed to see in the first place.

  if (!isSignedIn) 
>>>>>>> 2d98fb0 (SA)
    return <Navigate to="/" replace />

  return <>{children}</>
}
