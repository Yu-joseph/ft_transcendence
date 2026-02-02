import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import Game from './Game.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

function MissingClerkKey() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-xl space-y-3">
        <h1 className="text-2xl font-bold">Clerk is not configured</h1>
        <p className="text-slate-200">
          Missing <span className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</span>. Add it to your env and restart the dev server.
        </p>
        <p className="text-slate-300 text-sm">
          Example: <span className="font-mono">VITE_CLERK_PUBLISHABLE_KEY=pk_test_…</span>
        </p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Game />
      </ClerkProvider>
    ) : (
      <MissingClerkKey />
    )}
  </StrictMode>,
)
