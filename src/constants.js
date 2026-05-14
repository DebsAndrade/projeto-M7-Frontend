// Constantes compartilhadas entre as páginas do projeto.
// Centralizar aqui evita repetir os mesmos valores em vários ficheiros.

// Categorias de tarefas disponíveis no sistema
export const CATEGORIES = ['Trabalho', 'Pessoal', 'Estudos']

// Prioridades disponíveis (value = valor enviado à API, label = texto exibido)
export const PRIORITIES = [
  { value: 'URGENT', label: 'Urgente' },
  { value: 'HIGH',   label: 'Alta' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'LOW',    label: 'Baixa' },
]

// Cores dos badges de categoria (usadas no Dashboard e na página de Tarefas)
export const categoryColors = { Trabalho: 'default', Pessoal: 'warning', Estudos: 'success' }

// Rótulos de prioridade em português (usados nas Tarefas e no ChatBot)
export const priorityLabels = { URGENT: 'Urgente', HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' }

// Classes CSS para as etiquetas de prioridade na tabela de tarefas
export const priorityColors = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH:   'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-blue-100 text-blue-600',
  LOW:    'bg-gray-100 text-gray-500',
}
