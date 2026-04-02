import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Game from './Game.tsx'
import Lobby from './Lobby.tsx'
import Login from './Login.tsx'
import Dashboard from "./Dashboard.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Tournament from './Tournament.tsx'
import ProtectedRoute from '../components/ProtectedRoute.tsx'
import { AuthProvider } from '../contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path ="/Chat" element={<ProtectedRoute><div>chat</div></ProtectedRoute>} />
          <Route path ="/Friends" element={<ProtectedRoute><div>Friend</div></ProtectedRoute>} />
          <Route path="/AiChallange" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
          <Route path="/Tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
          <Route path="/game/:matchId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
