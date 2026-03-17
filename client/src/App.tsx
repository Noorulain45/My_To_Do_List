import { useState, useEffect, type KeyboardEvent } from 'react'
import './App.css'

// ── TypeScript types (mirrors backend types.ts) ──────────────────────────────
interface Task {
  id: number
  title: string
  isCompleted: boolean
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ── API base URL ──
const API = 'https://server-3rrlzgnz1-noorulain45s-projects.vercel.app/api/tasks'

// ── API helper functions ──
const api = {
  async getAll(): Promise<Task[]> {
    const res = await fetch(API)
    const json: ApiResponse<Task[]> = await res.json()
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to load tasks')
    return json.data
  },

  async create(title: string): Promise<Task> {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const json: ApiResponse<Task> = await res.json()
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to create task')
    return json.data
  },

  async toggle(id: number, isCompleted: boolean): Promise<Task> {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted }),
    })
    const json: ApiResponse<Task> = await res.json()
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to update task')
    return json.data
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
    const json: ApiResponse<null> = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to delete task')
  },
}

// ── Component ────────────────────────────────────────────────────────────────
function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [apiError, setApiError] = useState<string>('')

  // Load tasks on mount
  useEffect(() => {
    api.getAll()
      .then(setTasks)
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const showInputError = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(''), 2500)
  }

  // POST /api/tasks
  const addTask = async () => {
    if (!inputValue.trim()) {
      showInputError('✿ task title is required')
      return
    }

    try {
      const newTask = await api.create(inputValue.trim())
      setTasks((prev) => [...prev, newTask])
      setInputValue('')
      setError('')
    } catch (err: unknown) {
      showInputError((err as Error).message)
    }
  }

  // PUT /api/tasks/:id
  const toggleTask = async (id: number, current: boolean) => {
    try {
      const updated = await api.toggle(id, !current)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err: unknown) {
      setApiError((err as Error).message)
    }
  }

  // DELETE /api/tasks/:id
  const deleteTask = async (id: number) => {
    try {
      await api.delete(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err: unknown) {
      setApiError((err as Error).message)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTask()
  }

  const totalTasks = tasks.length
  const pendingTasks = tasks.filter((t) => !t.isCompleted).length
  const doneTasks = tasks.filter((t) => t.isCompleted).length

  return (
    <div className="app">
      <h1 className="app-title">my tasks ♡</h1>
      <p className="app-subtitle">your little to-do list</p>

      {/* API error banner */}
      {apiError && (
        <div className="api-error">
          ⚠ {apiError}
          <button onClick={() => setApiError('')}>×</button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-num">{totalTasks}</span>
          <span className="stat-label">total</span>
        </div>
        <div className="stat">
          <span className="stat-num">{pendingTasks}</span>
          <span className="stat-label">pending</span>
        </div>
        <div className="stat">
          <span className="stat-num">{doneTasks}</span>
          <span className="stat-label">done</span>
        </div>
      </div>

      {/* Input Row */}
      <div className="input-row">
        <input
          className={`task-input ${error ? 'input-error' : ''}`}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="add something cute to do..."
          maxLength={200}
          disabled={loading}
        />

        <button className="add-btn" onClick={addTask} disabled={loading}>
          + add
        </button>
      </div>

      {/* Validation error */}
      <p className="error-msg">{error}</p>

      {/* Task List */}
      {loading ? (
        <div className="loading-state">loading your tasks...</div>
      ) : (
        <ul className="task-list">
          {tasks.length === 0 ? (
            <li className="empty-state">🌸 nothing here yet — add a task!</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className={`task-item ${task.isCompleted ? 'done' : ''}`}>
                {/* Toggle complete */}
                <button
                  className={`check-btn ${task.isCompleted ? 'checked' : ''}`}
                  onClick={() => toggleTask(task.id, task.isCompleted)}
                  aria-label="Toggle complete"
                >
                  {task.isCompleted && (
                    <svg className="checkmark" viewBox="0 0 11 11" fill="none">
                      <polyline
                        points="1.5,5.5 4.2,8 9,2.5"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Title */}
                <span className="task-title">{task.title}</span>

                {/* Delete */}
                <button
                  className="del-btn"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default App