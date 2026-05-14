import { useEffect, useState } from 'react'
import { getTags, createTag, deleteTag } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, Tag } from 'lucide-react'

export default function Tags() {
  const [tags, setTags] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState('')

  const load = () => getTags().then(setTags).catch(console.error)
  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    try { await createTag(name.trim()); setName(''); setDialogOpen(false); load() }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleDelete(id, tagName) {
    if (!confirm(`Apagar a tag "${tagName}"? Será removida de todas as tarefas.`)) return
    try { await deleteTag(id); load() }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#39324D]">Tags</h2>
          <p className="text-sm text-[#9087A0]">{tags.length} tag(s)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setError(''); setName('') }}><Plus className="w-4 h-4" /> Nova Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Tag</DialogTitle></DialogHeader>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Nome da Tag</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="ex: urgente, revisão..." required className="mt-1" />
              </div>
              <Button type="submit" disabled={loading || !name.trim()} className="w-full">
                {loading ? 'A criar...' : 'Criar Tag'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tags.length === 0
        ? (
          <div className="text-center py-16 text-[#9087A0]">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ainda não há tags. Cria a primeira!</p>
          </div>
        )
        : (
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 bg-white border border-[#EDCDD6] rounded-full px-4 py-2 shadow-sm">
                <Tag className="w-3 h-3 text-[#ED5887]" />
                <span className="text-sm font-medium text-[#39324D]">{tag.name}</span>
                <button onClick={() => handleDelete(tag.id, tag.name)} className="text-[#9087A0] hover:text-red-500 transition-colors ml-1" title="Apagar">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
