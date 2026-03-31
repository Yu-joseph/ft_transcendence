import { Navigate } from 'react-router-dom'
import { useCustomAuth } from '../hooks/useCustomAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useCustomAuth()

<<<<<<< HEAD
  if (!isLoaded) 
    return null // wait for Clerk to initialise
<<<<<<< HEAD
<<<<<<< HEAD
//when an unauthenticated user tries to access a protected route, 
// using `replace` prevents them from pressing the **back button** to return 
// to the protected page they were never allowed to see in the first place.
=======
>>>>>>> 8279122 (fixing realoding)
=======
//when an unauthenticated user tries to access a protected route, 
// using `replace` prevents them from pressing the **back button** to return 
// to the protected page they were never allowed to see in the first place.
>>>>>>> eef5d5f (fixing bug in torunamnet player redrcted to tournamnet after he win)
=======
  if (!isLoaded)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Checking session...
      </div>
    )

  // Using `replace` prevents navigating back to protected pages after redirect.
>>>>>>> 103627e (merging game with main and fixing login page with jwt)

  if (!isSignedIn) 
    return <Navigate to="/" replace />

  return <>{children}</>
}
