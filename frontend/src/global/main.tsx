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
import { ChatSystemLayout } from '../chat-system/ChatSystemLayout.tsx'
import { Chat } from '../chat-system/pages/Chat.tsx'
import { Friends } from '../chat-system/pages/Friends.tsx'
import { Profile } from '../chat-system/pages/Profile.tsx'
import GlobalInviteListener from '../components/GlobalInviteListener.tsx'
import ChangePassw from '../auth/ChangePassw.tsx'
import ChangeIntra from './ChangeIntra.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <GlobalInviteListener />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route element={<ProtectedRoute><ChatSystemLayout/></ProtectedRoute>}>
            <Route path ="/Chat" element={<Chat />} />
            <Route path ="/Friends" element={<Friends />} />
            <Route path='/Profile/:id/' element={<Profile />} />
          </Route>
          <Route path='/changeps' element={<ProtectedRoute><ChangeIntra/></ProtectedRoute>}></Route>
          {/* Intra backend redirect uses a different casing, keep an alias route. */}
          <Route path='/ChangeIntra' element={<ProtectedRoute><ChangeIntra/></ProtectedRoute>}></Route>
          <Route path="/Tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
          <Route path="/game/:matchId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/AiChallange" element={<ProtectedRoute><AiChallange /></ProtectedRoute>} />
          <Route path="/Chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/profile/setting' element={<ProtectedRoute><ChangePassw /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)