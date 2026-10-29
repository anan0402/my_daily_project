import { FAKE_CURRENT_USER_ID } from '@/testing/fake-plans-db'

export const PLAN_VIEWS = [
  { value: 'mine', label: 'My plans', mobileLabel: 'Mine', eyebrow: 'Your workspace', title: 'Plans' },
  { value: 'shared', label: 'Shared with me', mobileLabel: 'Shared', eyebrow: 'Collaboration', title: 'Shared with me', description: 'Plans other people invited you to.' },
  { value: 'discover', label: 'Discover', mobileLabel: 'Discover', eyebrow: 'Community', title: 'Discover', description: 'Useful plans made public by the community.' },
  { value: 'saved', label: 'Saved', mobileLabel: 'Saved', eyebrow: 'Bookmarks', title: 'Saved', description: 'Public plans you saved for later.' }
]

export const getPlanView = (value) => PLAN_VIEWS.find((item) => item.value === value) || PLAN_VIEWS[0]

export const PLAN_VISIBILITIES = [
  { value: 'private', label: 'Private', description: 'Only you can open this plan.' },
  { value: 'shared', label: 'Shared', description: 'Only invited members can open this plan.' },
  { value: 'public', label: 'Public', description: 'Anyone with the link can view it. Only members can edit.' }
]

export const getVisibilityLabel = (value) =>
  PLAN_VISIBILITIES.find((item) => item.value === value)?.label || value

export const PLAN_COLORS = [
  { value: 'ink', label: 'Ink', hex: '#111111' },
  { value: 'forest', label: 'Forest', hex: '#2f6b4f' },
  { value: 'ocean', label: 'Ocean', hex: '#2563a8' },
  { value: 'berry', label: 'Berry', hex: '#8a3ffc' },
  { value: 'rose', label: 'Rose', hex: '#d9467a' },
  { value: 'sun', label: 'Sun', hex: '#e8a317' }
]

export const getPlanColor = (value) => (PLAN_COLORS.find((item) => item.value === value) || PLAN_COLORS[0]).hex

export const PLAN_TEMPLATES = [
  { value: 'blank', label: 'Blank', tasks: [] },
  {
    value: 'trip',
    label: 'Trip',
    description: 'Tickets, stay, route and packing.',
    tasks: ['Book transport', 'Reserve a place to stay', 'Plan the daily route', 'Pack the bags']
  },
  {
    value: 'launch',
    label: 'Product launch',
    description: 'From copy to launch day.',
    tasks: ['Write launch copy', 'Design the landing page', 'Set up analytics', 'Announce the launch']
  },
  {
    value: 'study',
    label: 'Study plan',
    description: 'A steady routine towards an exam.',
    tasks: ['Take a diagnostic test', 'Set a weekly schedule', 'Practice every day', 'Take a mock exam']
  },
  {
    value: 'routine',
    label: 'Daily routine',
    description: 'Small habits, every day.',
    tasks: ['Drink a glass of water', 'Stretch for 10 minutes', 'Read 5 pages']
  }
]

export const ROLE_LABELS = {
  owner: 'Owner',
  editor: 'Can edit',
  viewer: 'Can view'
}

export const canEditPlan = (plan) => plan?.myRole === 'owner' || plan?.myRole === 'editor'

export const isPlanOwner = (plan) => plan?.myRole === 'owner'

export const getPlanProgress = (plan) => {
  const total = plan?.tasks?.length || 0
  const completed = plan?.tasks?.filter((task) => task.completed).length || 0
  return {
    total,
    completed,
    percent: total ? Math.round((completed / total) * 100) : 0
  }
}

export const formatDueDate = (dueDate) => {
  if (!dueDate) return 'No due date'
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const formatCount = (value) =>
  value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(value)

export const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

export const getCurrentUserName = (currentUser) =>
  currentUser?.displayName || currentUser?.name || currentUser?.username || 'You'

/** Thành viên "me" trong fake DB hiển thị bằng tên của tài khoản đang đăng nhập */
export const getMemberName = (member, currentUser) =>
  member._id === FAKE_CURRENT_USER_ID ? getCurrentUserName(currentUser) : member.name
