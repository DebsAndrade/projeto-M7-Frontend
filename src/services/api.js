const BASE_URL = 'http://localhost:3000'

// helper: faz o fetch e lança erro se a resposta não for ok
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ${res.status}`)
  }
  return res.json()
}

// ==================== UTILIZADORES ====================
export const getUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request('/users' + (query ? '?' + query : ''))
}
export const getUserStats = () => request('/users/stats')
export const createUser = (data) => request('/users', { method: 'POST', body: JSON.stringify(data) })
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const toggleUserActive = (id) => request(`/users/${id}`, { method: 'PATCH' })
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' })

// ==================== TAREFAS ====================
export const getTasks = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request('/tasks' + (query ? '?' + query : ''))
}
export const getTaskStats = () => request('/tasks/stats')
export const createTask = (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) })
export const updateTask = (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' })
export const addTagToTask = (taskId, tagId) =>
  request(`/tasks/${taskId}/tags`, { method: 'POST', body: JSON.stringify({ tagId }) })

// ==================== TAGS ====================
export const getTags = () => request('/tags')
export const createTag = (name) => request('/tags', { method: 'POST', body: JSON.stringify({ name }) })
export const deleteTag = (id) => request(`/tags/${id}`, { method: 'DELETE' })

// ==================== CHAT (GEMINI) ====================
// retorna o fetch cru (não faz parse — é streaming)
export const sendChatMessage = (message, history) =>
  fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
