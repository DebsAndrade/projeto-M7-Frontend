import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CheckSquare, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Utilizadores', icon: Users },
  { to: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { to: '/tags', label: 'Tags', icon: Tag },
]

export function Navbar() {
  return (
    <aside className="w-56 min-h-screen flex flex-col" style={{ backgroundColor: '#39324D' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold text-[#FFE8EF]">TaskBot</h1>
        <p className="text-xs" style={{ color: '#ED5887' }}>Gestão de Tarefas + AI</p>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#C22557] text-white font-medium'
                  : 'text-[#FFE8EF]/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
