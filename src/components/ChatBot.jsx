import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { sendChatMessage, createTask, updateTask, deleteTask, getTasks, getUsers } from '@/services/api'
import { priorityLabels } from '@/constants'

// formata uma lista de tarefas em texto legível para o chat
function formatTaskList(tasks) {
  if (tasks.length === 0) return 'Nenhuma tarefa encontrada.'
  return tasks.map((t, i) => {
    const priority = priorityLabels[t.priority] || t.priority || ''
    const due = t.due_date ? ` · Prazo: ${new Date(t.due_date).toLocaleDateString('pt-PT')}` : ''
    const state = t.done ? 'Concluída' : 'Pendente'
    return `${i + 1}. ${t.title} [${t.category}${priority ? ' · ' + priority : ''}${due}] — ${state}`
  }).join('\n')
}

// Avisa a página de Tarefas para recarregar a lista após uma alteração feita pelo bot.
// A página ouve este evento e chama loadTasks() automaticamente.
function notificarMudancaDeTarefas() {
  globalThis.dispatchEvent(new CustomEvent('tasks-changed'))
}

const INITIAL_MESSAGE = { role: 'model', text: 'Olá! Sou o TaskBot 🌸 Podes pedir-me para criar tarefas, atualizar prioridades, definir prazos ou filtrar tarefas por urgência!' }

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('taskbot-history')
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE]
    } catch {
      return [INITIAL_MESSAGE]
    }
  })
  const bottomRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('taskbot-history', JSON.stringify(messages))
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  // Processa a ação que o bot pediu para executar (criar, atualizar, filtrar ou apagar tarefas).
  // É chamada depois de receber a resposta completa do servidor.
  // Executa a ação que o bot pediu e devolve o texto final a mostrar no chat.
  // Assim o handleSend faz apenas UMA chamada a setMessages, evitando bolhas duplicadas.
  async function processarAcaoDoBot(action, baseText) {
    // ── CRIAR TAREFA ────────────────────────────────────
    if (action.type === 'CREATE_TASK') {
      const users = await getUsers()
      const activeUser = users.find(u => u.active)
      if (activeUser) {
        await createTask({
          title: action.title,
          category: action.category || 'Trabalho',
          priority: action.priority || 'MEDIUM',
          dueDate: action.dueDate || null,
          userId: activeUser.id
        })
        notificarMudancaDeTarefas()
      }
      return baseText
    }

    // ── ATUALIZAR TAREFA ─────────────────────────────────
    if (action.type === 'UPDATE_TASK') {
      const tasks = await getTasks()
      const searchTitle = (action.taskTitle || '').toLowerCase()
      const target = tasks.find(t =>
        t.title.toLowerCase().includes(searchTitle) || searchTitle.includes(t.title.toLowerCase())
      )
      if (target) {
        const updates = {}
        if (action.title !== undefined && action.title !== null) updates.title = action.title
        if (action.category !== undefined && action.category !== null) updates.category = action.category
        if (action.priority !== undefined && action.priority !== null) updates.priority = action.priority
        if (action.dueDate !== undefined) updates.dueDate = action.dueDate
        if (action.done !== undefined && action.done !== null) updates.done = action.done
        if (Object.keys(updates).length > 0) {
          await updateTask(target.id, updates)
          notificarMudancaDeTarefas()
          return baseText + '\n\n✅ Tarefa atualizada com sucesso.'
        }
      } else {
        return baseText + '\n\n⚠️ Não encontrei nenhuma tarefa com esse nome.'
      }
      return baseText
    }

    // ── FILTRAR TAREFAS ──────────────────────────────────
    if (action.type === 'FILTER_TASKS') {
      const params = {}
      if (action.priority) params.priority = action.priority
      if (action.done !== undefined && action.done !== null) params.done = String(action.done)
      if (action.category) params.category = action.category
      const filtered = await getTasks(params)
      const taskList = formatTaskList(filtered)
      return baseText + '\n\n' + taskList
    }

    // ── APAGAR TAREFA ────────────────────────────────────
    if (action.type === 'DELETE_TASK') {
      const tasks = await getTasks()
      const searchTitle = (action.taskTitle || '').toLowerCase()
      const target = tasks.find(t =>
        t.title.toLowerCase().includes(searchTitle) || searchTitle.includes(t.title.toLowerCase())
      )
      if (target) {
        await deleteTask(target.id)
        notificarMudancaDeTarefas()
        return baseText + '\n\n✅ Tarefa apagada com sucesso.'
      } else {
        return baseText + '\n\n⚠️ Não encontrei nenhuma tarefa com esse nome para apagar.'
      }
    }

    return baseText
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMessage = { role: 'user', text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    // Adiciona a mensagem vazia do bot (será preenchida com o streaming)
    setMessages(prev => [...prev, { role: 'model', text: '' }])

    // updateBot: atualiza sempre o ÚLTIMO elemento do array (a mensagem do bot em construção).
    // Evita usar um índice fixo (botIndex) que pode desincronizar com o estado do React.
    function updateBot(text) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'model', text }
        return updated
      })
    }

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }))
      const response = await sendChatMessage(text, history)

      // Lê a resposta do servidor em tempo real (SSE = Server-Sent Events).
      // O servidor envia pequenos pedaços de texto à medida que o Gemini vai gerando.
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Cada "value" é um pedaço de bytes → converte para texto
        const chunk = decoder.decode(value)

        // O formato SSE tem linhas como: "data: {\"text\":\"olá\"}"
        // Filtramos só as linhas que começam com "data: "
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

        for (const line of lines) {
          // Remove o prefixo "data: " para obter só o conteúdo JSON
          const conteudoJSON = line.replace('data: ', '').trim()
          if (conteudoJSON === '[DONE]') break
          try {
            const parsed = JSON.parse(conteudoJSON)
            if (parsed.text) {
              fullText += parsed.text
              updateBot(fullText)
            }
          } catch { /* ignora linhas inválidas */ }
        }
      }

      // Deteta se o bot incluiu uma ação na resposta (ex: <action>{"type":"CREATE_TASK"...}</action>)
      const actionRegex = /<action>([\s\S]*?)<\/action>/
      const actionMatch = actionRegex.exec(fullText)
      // Remove sempre a tag <action> do texto visível ao utilizador
      const baseText = fullText.replace(/<action>[\s\S]*?<\/action>/g, '').trim()

      if (actionMatch) {
        // Executa a ação e obtém o texto final (pode incluir ✅ ou ⚠️)
        // processarAcaoDoBot devolve o texto em vez de chamar setMessages,
        // para que só haja UMA mensagem atualizada no chat.
        let textoFinal = baseText
        try {
          const action = JSON.parse(actionMatch[1].trim())
          textoFinal = await processarAcaoDoBot(action, baseText)
        } catch (e) {
          textoFinal = baseText + '\n\n⚠️ Erro ao executar a ação: ' + e.message
        }
        updateBot(textoFinal)
      } else {
        updateBot(baseText)
      }
    } catch {
      updateBot('Ocorreu um erro. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center z-50 transition-colors"
        style={{ backgroundColor: open ? '#A01E49' : '#C22557' }}
        aria-label="Abrir chatbot"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Janela do chat */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-120 bg-white rounded-2xl shadow-2xl border border-[#ED5887] flex flex-col z-50">
          {/* Cabeçalho */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-t-2xl" style={{ backgroundColor: '#C22557' }}>
            <Bot className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm font-semibold text-white">TaskBot AI</p>
              <p className="text-xs" style={{ color: '#FFB8CE' }}>Powered by Gemini</p>
            </div>
            <button
              onClick={() => setMessages([INITIAL_MESSAGE])}
              title="Limpar histórico"
              className="ml-auto text-white/60 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ backgroundColor: '#FFFAFC' }}>
            {messages.map((msg, i) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: '#FFE8EF' }}>
                    <Bot className="w-3 h-3" style={{ color: '#C22557' }} />
                  </div>
                )}
                <div
                  className="max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap"
                  style={msg.role === 'user'
                    ? { backgroundColor: '#C22557', color: 'white', borderBottomRightRadius: '4px' }
                    : { backgroundColor: '#FFE8EF', color: '#39324D', borderBottomLeftRadius: '4px' }
                  }
                >
                  {msg.text || (loading && i === messages.length - 1 ? '▌' : '')}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: '#FFD6E4' }}>
                    <User className="w-3 h-3" style={{ color: '#504375' }} />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#FFD6E4] flex gap-2 bg-white rounded-b-2xl">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreve uma mensagem..."
              className="text-sm border-[#EDCDD6] focus-visible:ring-[#C22557]"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-md flex items-center justify-center text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: '#C22557' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
