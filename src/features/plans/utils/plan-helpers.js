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
  { value: 'public', label: 'Public', description: 'Anyone with the link can view and copy this plan. Only members can edit.' }
]

export const getVisibilityLabel = (value) =>
  PLAN_VISIBILITIES.find((item) => item.value === value)?.label || value

// Server chỉ lưu key (PLANS_API.md 8.8), FE map sang màu
export const PLAN_COVER_COLORS = [
  { value: 'ink', label: 'Ink', color: 'var(--color-fg)' },
  { value: 'sand', label: 'Sand', color: '#E9E1D3' },
  { value: 'sage', label: 'Sage', color: '#CFD8C8' },
  { value: 'sky', label: 'Sky', color: '#CBD9E6' },
  { value: 'rose', label: 'Rose', color: '#E8CFCF' },
  { value: 'amber', label: 'Amber', color: '#EED9B0' }
]

export const getCoverColor = (value) =>
  (PLAN_COVER_COLORS.find((item) => item.value === value) || PLAN_COVER_COLORS[0]).color

export const ROLE_LABELS = {
  owner: 'Owner',
  editor: 'Can edit',
  viewer: 'Can view',
  public_viewer: 'Visitor'
}

export const TASK_STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' }
]

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export const canEditPlan = (plan) => plan?.myRole === 'owner' || plan?.myRole === 'editor'

export const isPlanOwner = (plan) => plan?.myRole === 'owner'

// owner / editor / viewer; public_viewer là người ngoài xem plan public
export const isPlanParticipant = (plan) => Boolean(plan?.myRole) && plan.myRole !== 'public_viewer'

/** Owner + members (members từ server không gồm owner) */
export const getPlanPeople = (plan) => {
  if (!plan) return []
  const owner = plan.owner ? [{ ...plan.owner, role: 'owner' }] : []
  return [...owner, ...(plan.members || [])]
}

export const getPersonName = (person) => person?.displayName || person?.username || 'Unknown'

export const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

// dueDate là ISO ở 00:00 UTC; giữ UTC khi đổi qua lại với <input type="date"> để không lệch ngày
export const toIsoDate = (inputValue) => (inputValue ? `${inputValue}T00:00:00.000Z` : null)

export const toDateInputValue = (isoDate) => (isoDate ? isoDate.slice(0, 10) : '')

export const formatDueDate = (isoDate, emptyLabel = 'No deadline') => {
  if (!isoDate) return emptyLabel
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export const isOverdue = (isoDate) => {
  if (!isoDate) return false
  const today = new Date().toISOString().slice(0, 10)
  return isoDate.slice(0, 10) < today
}

export const formatCount = (value = 0) =>
  value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(value)
