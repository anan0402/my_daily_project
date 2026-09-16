import authorizeAxiosInstance from '@/utils/authorizeAxiosInstance'

export const getAllTodos = async () => {
  const response = await authorizeAxiosInstance.get('/v1/todos')
  return response.data
}

export const createTodo = async ({ title }) => {
  const response = await authorizeAxiosInstance.post('/v1/todos', { title })
  return response.data
}

export const getTodoDetails = async (id) => {
  const response = await authorizeAxiosInstance.get(`/v1/todos/${id}`)
  return response.data
}

export const updateTodo = async ({ id, title }) => {
  const response = await authorizeAxiosInstance.put(`/v1/todos/${id}`, { title })
  return response.data
}

export const deleteTodo = async (id) => {
  const response = await authorizeAxiosInstance.delete(`/v1/todos/${id}`)
  return response.data
}

export const toggleTodoComplete = async (id) => {
  const response = await authorizeAxiosInstance.put(`/v1/todos/${id}/toggle`)
  return response.data
}

export const clearCompletedTodos = async () => {
  const response = await authorizeAxiosInstance.delete('/v1/todos/clear-completed')
  return response.data
}
