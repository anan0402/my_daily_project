import { useState } from 'react'

import { useClearCompletedTodos } from '@/features/todos/api/clear-completed-todos'
import { useCreateTodo } from '@/features/todos/api/create-todo'
import { useDeleteTodo } from '@/features/todos/api/delete-todo'
import { useTodos } from '@/features/todos/api/get-todos'
import { useToggleTodo } from '@/features/todos/api/toggle-todo'
import './todo-list.css'

function TodoList() {
  const [newTask, setNewTask] = useState('')

  const { data: todosResponse, isLoading } = useTodos()

  const pendingTodos = todosResponse?.todos || []
  const completedTodos = todosResponse?.completedTodos || []
  const stats = todosResponse?.stats || { total: 0, completed: 0, pending: 0 }

  const createMutation = useCreateTodo()
  const deleteMutation = useDeleteTodo()
  const toggleMutation = useToggleTodo()
  const clearCompletedMutation = useClearCompletedTodos()

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
  )
}

export default TodoList
