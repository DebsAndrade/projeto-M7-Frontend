# Sistema de Gestão de Tarefas com ChatBot - Frontend

Frontend TypeScript puro (Vanilla TS + Vite) para gerenciar usuários, tarefas e tags.

**Repositório**: https://github.com/DebsAndrade/projeto-M7-Frontend
**Autor**: Débora Andrade

## 🛠️ Tecnologias

- TypeScript 5.9.3
- Vite 7.3.1
- CSS3 com CSS Variables
- Fetch API
 - Gemini (modelo de IA) — integrado no TaskBot

## 📂 Estrutura

```
src/
├── api/              # Chamadas HTTP (fetch)
├── models/           # Interfaces TypeScript
├── services/         # Gerenciamento de estado
├── ui/               # Renderização do DOM
└── utils/            # Utilitários (formatters, validators)
```


## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- pnpm 10+
- Backend rodando em `http://localhost:3000`

### Setup

```bash
# Instalar dependências
pnpm install

# Iniciar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

O frontend estará em `http://localhost:5173`

## 📡 Endpoints

**Users**: `POST /users`, `GET /users`, `PUT /users/:id`, `DELETE /users/:id`
**Tasks**: `POST /tasks`, `GET /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`
**Tags**: `POST /tags`, `GET /tags`, `DELETE /tags/:id`

## ✨ Funcionalidades

- ✅ Gerenciar usuários (criar, editar, deletar, buscar)
- ✅ Gerenciar tarefas (criar, editar, deletar, marcar como concluída)
- ✅ Gerenciar tags (criar, deletar, associar a tarefas)
- ✅ Busca e ordenação de usuários e tarefas
- ✅ Estatísticas em tempo real
- ✅ Categorias de tarefas (Trabalho, Pessoal, Estudos)
- ✅ Responsive design

## 📖 Validações

- Email deve conter `@` e `.`
- Nome de usuário é obrigatório
- Título de tarefa com mínimo 3 caracteres
- Responsável deve ser um usuário ativo


