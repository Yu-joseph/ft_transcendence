import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) 
    return null // wait for Clerk to initialise
<<<<<<< HEAD
//when an unauthenticated user tries to access a protected route, 
// using `replace` prevents them from pressing the **back button** to return 
// to the protected page they were never allowed to see in the first place.
=======
>>>>>>> 8279122 (fixing realoding)

  if (!isSignedIn) 
    return <Navigate to="/" replace />

  return <>{children}</>
}
