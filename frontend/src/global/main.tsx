import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../Game/index.css'
import Game from '../Game/Game.tsx'
import Login from './Login.tsx'
import Dashboard from "./Dashboard.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Tournament from '../Game/Tournament.tsx'
import ProtectedRoute from '../components/ProtectedRoute.tsx'
import { AuthProvider } from '../auth/AuthContext.tsx'
import { AiChallange } from '../AiPages/AiChallange.tsx'
import Chatbot from '../AiPages/Chatbot.tsx'
import Profile from './Profile.tsx'

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
          <Route path="/Tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
          <Route path="/game/:matchId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/AiChallange" element={<ProtectedRoute><AiChallange /></ProtectedRoute>} />
          <Route path="/Chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
