import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Chat } from './pages/Chat';
import { Friend } from './pages/Friends';
import { Profile } from './pages/Profile';
import  Bar   from  './components/shared/Bar';
import BottomNav from './components/shared/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen overflow-hidden bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
        <Bar/>
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path='/chat' element={<Chat/>}/>
            <Route path='/friends' element={<Friend/>}/>
            <Route path='/profile' element={<Profile/>}/>
          </Routes>
        </main>
        <BottomNav/>
      </div>
    </BrowserRouter>
  )
}

export default App
