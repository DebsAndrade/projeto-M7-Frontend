import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { getTasks, createTask, updateTask, deleteTask, addTagToTask, getUsers, getTags } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Check, Tag } from 'lucide-react'
import { CATEGORIES, PRIORITIES, categoryColors, priorityColors, priorityLabels } from '@/constants'

function TaskForm({ initial = {}, users, onSubmit, loading }) {
  const [title, setTitle] = useState(initial.title || '')
  const [category, setCategory] = useState(initial.category || '')
  const [priority, setPriority] = useState(initial.priority || 'MEDIUM')
  // o MySQL retorna datas com hora (ex: "2025-06-01T00:00:00.000Z"), mas o input type="date" precisa só de "YYYY-MM-DD"
  const [dueDate, setDueDate] = useState(initial.due_date ? initial.due_date.slice(0, 10) : '')
  const [userId, setUserId] = useState(initial.user_id ? String(initial.user_id) : '')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ title, category, priority, dueDate: dueDate || null, userId: Number(userId) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Título</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required minLength={3} className="mt-1" />
      </div>
      <div>
        <Label>Categoria</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Escolhe uma categoria" /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>Prioridade</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Escolhe a prioridade" /></SelectTrigger>
          <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>Prazo</Label>
        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>Responsável</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Escolhe um utilizador" /></SelectTrigger>
          <SelectContent>
            {users.filter(u => u.active).map(u => (
              <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading || !category || !userId} className="w-full">
        {loading ? 'A guardar...' : 'Guardar'}
      </Button>
    </form>
  )
}

TaskForm.propTypes = {
  initial: PropTypes.shape({
    title: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.string,
    due_date: PropTypes.string,
    user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      active: PropTypes.bool,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}

function TagForm({ tags, onSubmit, loading }) {
  const [tagId, setTagId] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(Number(tagId)) }} className="space-y-4">
      <div>
        <Label>Tag</Label>
        <Select value={tagId} onValueChange={setTagId}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Escolhe uma tag" /></SelectTrigger>
          <SelectContent>{tags.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading || !tagId} className="w-full">
        {loading ? 'A adicionar...' : 'Adicionar Tag'}
      </Button>
    </form>
  )
}

TagForm.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [tagTargetId, setTagTargetId] = useState(null)
  const [error, setError] = useState('')

  const loadTasks = () => {
    const params = {}
    if (search) params.search = search
    if (filterPriority) params.priority = filterPriority
    return getTasks(params).then(setTasks).catch(console.error)
  }

  useEffect(() => { loadTasks(); getUsers().then(setUsers); getTags().then(setTags) }, [])
  useEffect(() => { loadTasks() }, [search, filterPriority])

  // Guarda sempre a versão mais recente de loadTasks numa ref,
  // para que o listener do ChatBot possa chamá-la corretamente.
  const loadTasksRef = useRef(loadTasks)
  loadTasksRef.current = loadTasks

  // Ouve o evento 'tasks-changed' que o ChatBot dispara depois de criar/apagar/editar uma tarefa.
  // Assim a lista atualiza automaticamente sem precisar de recarregar a página.
  useEffect(() => {
    function handleTasksChanged() {
      loadTasksRef.current()
    }
    globalThis.addEventListener('tasks-changed', handleTasksChanged)
    return () => globalThis.removeEventListener('tasks-changed', handleTasksChanged)
  }, [])

  async function handleCreate(data) {
    setLoading(true)
    setError('')
    try {
      await createTask(data)
      setDialogOpen(false)
      loadTasks()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(data) {
    setLoading(true)
    setError('')
    try {
      await updateTask(editTask.id, data)
      setDialogOpen(false)
      setEditTask(null)
      loadTasks()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleDone(task) {
    try { await updateTask(task.id, { done: !task.done }); loadTasks() }
    catch (e) { alert(e.message) }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Apagar "${title}"?`)) return
    try { await deleteTask(id); loadTasks() }
    catch (e) { alert(e.message) }
  }

  async function handleAddTag(tagId) {
    setLoading(true)
    try { await addTagToTask(tagTargetId, tagId); setTagDialogOpen(false); loadTasks() }
    catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  function openCreate() { setEditTask(null); setError(''); setDialogOpen(true) }
  function openEdit(task) { setEditTask(task); setError(''); setDialogOpen(true) }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#39324D]">Tarefas</h2>
          <p className="text-sm text-[#9087A0]">{tasks.length} tarefa(s)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4" /> Nova Tarefa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            </DialogHeader>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <TaskForm initial={editTask || {}} users={users} onSubmit={editTask ? handleEdit : handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Pesquisar por título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterPriority || 'all'} onValueChange={v => setFilterPriority(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Diálogo de adicionar tag */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Tag à Tarefa</DialogTitle></DialogHeader>
          <TagForm tags={tags} onSubmit={handleAddTag} loading={loading} />
        </DialogContent>
      </Dialog>

      <div className="border border-[#EDCDD6] rounded-xl overflow-hidden bg-white">
        {tasks.length === 0
          ? <p className="text-sm text-[#9087A0] text-center py-10">Nenhuma tarefa encontrada.</p>
          : (
            <table className="w-full text-sm">
              <thead className="bg-[#FFF0F5] text-[#9087A0] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-left">Prioridade</th>
                  <th className="px-4 py-3 text-left">Prazo</th>
                  <th className="px-4 py-3 text-left">Tags</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFD6E4]">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-[#FFF5F8] transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <span className={task.done ? 'line-through text-[#9087A0]' : 'text-[#39324D]'}>{task.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={categoryColors[task.category] || 'secondary'}>{task.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                        {priorityLabels[task.priority] || task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9087A0]">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-PT') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {task.tags && task.tags.length > 0
                          ? task.tags.map(tag => (
                            <span key={tag} className="text-xs bg-[#FFE8EF] text-[#504375] px-2 py-0.5 rounded-full">{tag}</span>
                          ))
                          : <span className="text-xs text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={task.done ? 'success' : 'warning'}>{task.done ? 'Concluída' : 'Pendente'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleToggleDone(task)} title="Marcar concluída">
                          <Check className={`w-4 h-4 ${task.done ? 'text-green-500' : 'text-gray-300'}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setTagTargetId(task.id); setTagDialogOpen(true) }} title="Adicionar tag">
                          <Tag className="w-4 h-4 text-[#ED5887]" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(task)} title="Editar">
                          <Pencil className="w-4 h-4 text-[#504375]" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id, task.title)} title="Apagar">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  )
}
