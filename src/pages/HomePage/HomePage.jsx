import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DefaultLayout from '@/components/templates/DefaultLayout/DefaultLayout'
import {
  getAllTodos,
  createTodo,
  deleteTodo,
  toggleTodoComplete,
  clearCompletedTodos
} from '@/services/todo.service'
import './HomePage.css'

function HomePage() {
  const [newTask, setNewTask] = useState('')
  const queryClient = useQueryClient()

  const { data: todosResponse, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: getAllTodos
  })

  const pendingTodos = todosResponse?.todos || []
  const completedTodos = todosResponse?.completedTodos || []
  const stats = todosResponse?.stats || { total: 0, completed: 0, pending: 0 }

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const toggleMutation = useMutation({
    mutationFn: toggleTodoComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const clearCompletedMutation = useMutation({
    mutationFn: clearCompletedTodos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const monthDay = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()

  const handleAddTask = () => {
    if (!newTask.trim()) return
    createMutation.mutate({ title: newTask.trim() })
    setNewTask('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  const handleToggle = (id) => {
    toggleMutation.mutate(id)
  }

  const handleDelete = (id) => {
    deleteMutation.mutate(id)
  }

  const handleClearAll = () => {
    clearCompletedMutation.mutate()
  }

  return (
    <DefaultLayout showSidebar={true}>
      <div className="todo-page">
        <div className="todo-container">
          {/* Header */}
          <div className="todo-header">
            <p className="todo-date">{dayName}, {monthDay}</p>
            <h1 className="todo-title">To-do</h1>
            <p className="todo-stats">
              {stats.pending} left · {stats.completed} done
            </p>
          </div>

          {/* Add Task */}
          <div className="todo-add">
            <input
              type="text"
              placeholder="New task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
              className="todo-add-input"
              disabled={createMutation.isPending}
            />
            <button
              onClick={handleAddTask}
              className="todo-add-button"
              disabled={createMutation.isPending}
            >
              ADD
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="todo-loading">Loading...</div>
          )}

          {/* Pending Tasks */}
          {!isLoading && (
            <div className="todo-list">
              {pendingTodos.map(todo => (
                <div key={todo._id} className="todo-item">
                  <label className="todo-checkbox">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo._id)}
                    />
                    <span className="todo-checkmark"></span>
                  </label>
                  <span className="todo-text">{todo.title}</span>
                  <button
                    className="todo-delete"
                    onClick={() => handleDelete(todo._id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          {!isLoading && completedTodos.length > 0 && (
            <>
              <div className="todo-section-header">
                <span className="todo-section-title">COMPLETED</span>
              </div>
              <div className="todo-list todo-list--completed">
                {completedTodos.map(todo => (
                  <div key={todo._id} className="todo-item todo-item--completed">
                    <label className="todo-checkbox">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo._id)}
                      />
                      <span className="todo-checkmark todo-checkmark--checked"></span>
                    </label>
                    <span className="todo-text">{todo.title}</span>
                  </div>
                ))}
              </div>
              <button className="todo-clear-all" onClick={handleClearAll}>
                CLEAR ALL
              </button>
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}

export default HomePage
