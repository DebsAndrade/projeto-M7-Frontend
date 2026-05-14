import { useEffect, useState } from 'react'
import { getUserStats, getTaskStats, getTasks, getUsers } from '@/services/api'
import { StatsCard } from '@/components/StatsCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { categoryColors } from '@/constants'

export default function Dashboard() {
  const [userStats, setUserStats] = useState(null)
  const [taskStats, setTaskStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    Promise.all([getUserStats(), getTaskStats(), getTasks(), getUsers()])
      .then(([uStats, tStats, tasks, users]) => {
        setUserStats(uStats)
        setTaskStats(tStats)
        setRecentTasks(tasks.slice(0, 5))
        setRecentUsers(users.slice(0, 5))
      })
      .catch(console.error)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#39324D]">Dashboard</h2>
        <p className="text-sm text-[#9087A0]">Visão geral do sistema</p>
      </div>

      <section>
        <h3 className="text-xs font-semibold text-[#9087A0] uppercase tracking-wide mb-3">Utilizadores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Total" value={userStats?.total ?? '—'} color="primary" />
          <StatsCard label="Ativos" value={userStats?.active ?? '—'} color="green" />
          <StatsCard label="Inativos" value={userStats?.inactive ?? '—'} color="red" />
          <StatsCard label="% Ativos" value={userStats ? `${userStats.percentageActive}%` : '—'} color="gray" />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-[#9087A0] uppercase tracking-wide mb-3">Tarefas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard label="Total" value={taskStats?.total ?? '—'} color="primary" />
          <StatsCard label="Pendentes" value={taskStats?.pending ?? '—'} color="red" />
          <StatsCard label="Concluídas" value={taskStats?.finished ?? '—'} color="green" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Últimas Tarefas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentTasks.length === 0
              ? <p className="text-sm text-gray-400">Sem tarefas.</p>
              : recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <p className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </p>
                  <Badge variant={categoryColors[task.category] || 'secondary'}>{task.category}</Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Utilizadores Registados</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.length === 0
              ? <p className="text-sm text-gray-400">Sem utilizadores.</p>
              : recentUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <Badge variant={user.active ? 'success' : 'secondary'}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
