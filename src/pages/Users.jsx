import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getUsers, createUser, updateUser, toggleUserActive, deleteUser } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserPlus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

function UserForm({ initial = {}, onSubmit, loading }) {
  const [name, setName] = useState(initial.name || '')
  const [email, setEmail] = useState(initial.email || '')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ name, email })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome</Label>
        <Input value={name} onChange={e => setName(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'A guardar...' : 'Guardar'}
      </Button>
    </form>
  )
}

UserForm.propTypes = {
  initial: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [error, setError] = useState('')

  const load = () => getUsers(search ? { search } : {}).then(setUsers).catch(console.error)

  useEffect(() => { load() }, [search])

  async function handleCreate(data) {
    setLoading(true)
    setError('')
    try {
      await createUser(data)
      setDialogOpen(false)
      load()
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
      await updateUser(editUser.id, data)
      setDialogOpen(false)
      setEditUser(null)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(id) {
    try { await toggleUserActive(id); load() }
    catch (e) { alert(e.message) }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Apagar "${name}"?`)) return
    try { await deleteUser(id); load() }
    catch (e) { alert(e.message) }
  }

  function openCreate() { setEditUser(null); setError(''); setDialogOpen(true) }
  function openEdit(user) { setEditUser(user); setError(''); setDialogOpen(true) }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#39324D]">Utilizadores</h2>
          <p className="text-sm text-[#9087A0]">{users.length} utilizador(es)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><UserPlus className="w-4 h-4" /> Novo Utilizador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? 'Editar Utilizador' : 'Novo Utilizador'}</DialogTitle>
            </DialogHeader>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <UserForm initial={editUser || {}} onSubmit={editUser ? handleEdit : handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Pesquisar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="border border-[#EDCDD6] rounded-xl overflow-hidden bg-white">
        {users.length === 0
          ? <p className="text-sm text-[#9087A0] text-center py-10">Nenhum utilizador encontrado.</p>
          : (
            <table className="w-full text-sm">
              <thead className="bg-[#FFF0F5] text-[#9087A0] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Criado em</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFD6E4]">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-[#FFF5F8] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#39324D]">{user.name}</td>
                    <td className="px-4 py-3 text-[#9087A0]">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.active ? 'success' : 'secondary'}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#9087A0]">
                      {new Date(user.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleToggle(user.id)} title="Ativar/Desativar">
                          {user.active
                            ? <ToggleRight className="w-4 h-4 text-green-500" />
                            : <ToggleLeft className="w-4 h-4 text-[#9087A0]" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(user)} title="Editar">
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(user.id, user.name)} title="Apagar">
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
