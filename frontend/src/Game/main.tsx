import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
<<<<<<< HEAD
import { ClerkProvider } from '@clerk/clerk-react'
=======
>>>>>>> 103627e (merging game with main and fixing login page with jwt)
import Game from './Game.tsx'
import Lobby from './Lobby.tsx'
import Login from './Login.tsx'
import Dashboard from "./Dashboard.tsx";
<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tournament from './Tournament.tsx'
<<<<<<< HEAD:frontend/src/Game/main.tsx
<<<<<<< HEAD:frontend/src/Game/main.tsx
import ProtectedRoute from '../components/ProtectedRoute.tsx'
=======
>>>>>>> e2ddfd1 (adding win medals):frontend/src/main.tsx
=======
import ProtectedRoute from './components/ProtectedRoute.tsx'
>>>>>>> 8279122 (fixing realoding):frontend/src/main.tsx
// import Lobby from './Lobby.tsx'


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
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
<<<<<<< HEAD:frontend/src/Game/main.tsx
<<<<<<< HEAD:frontend/src/Game/main.tsx
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Tournament from './Tournament.tsx'
import ProtectedRoute from '../components/ProtectedRoute.tsx'
// import Lobby from './Lobby.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
>>>>>>> 103627e (merging game with main and fixing login page with jwt)
        <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path ="/Chat" element={<ProtectedRoute><div>chat</div></ProtectedRoute>} />
        <Route path ="/Friends" element={<ProtectedRoute><div>Friend</div></ProtectedRoute>} />
        <Route path="/AiChallange" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/Tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
        <Route path="/game/:matchId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
<<<<<<< HEAD
=======
        <Route path= "/Dashboard" element={<Dashboard />} />
        <Route path="/AiChallange" element={<Lobby />} />
        <Route path="/Tournament" element={<Tournament />} />
        <Route path="/game/:matchId" element={<Game />} />
>>>>>>> e2ddfd1 (adding win medals):frontend/src/main.tsx
=======
        <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/AiChallange" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/Tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
        <Route path="/game/:matchId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
>>>>>>> 8279122 (fixing realoding):frontend/src/main.tsx
      </Routes>
    </BrowserRouter>
        {/* <Game /> */}
      </ClerkProvider>
    ) : (
      <MissingClerkKey />
    )}
=======
        <Route path="*" element={<Navigate to="/" replace />} />
        //// this route privante bad url 
      </Routes>
    </BrowserRouter>
>>>>>>> 103627e (merging game with main and fixing login page with jwt)
  </StrictMode>,
)
