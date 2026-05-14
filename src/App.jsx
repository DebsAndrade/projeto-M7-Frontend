import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { ChatBot } from '@/components/ChatBot'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import Tasks from '@/pages/Tasks'
import Tags from '@/pages/Tags'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#FFF5F7]">
        {/* Sidebar de navegação */}
        <Navbar />

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tags" element={<Tags />} />
          </Routes>
        </main>

        {/* Chatbot com Gemini — visível em todas as páginas */}
        <ChatBot />
      </div>
    </BrowserRouter>
  )
}
