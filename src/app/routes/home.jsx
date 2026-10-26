import DefaultLayout from '@/app/layouts/default-layout/default-layout'
import TodoList from '@/features/todos/components/todo-list'

function HomeRoute() {
  return (
    <DefaultLayout showSidebar={true}>
      <TodoList />
    </DefaultLayout>
  )
}

export default HomeRoute
