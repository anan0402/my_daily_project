/**
 * Fake backend cho Plan Workspace (chưa có /v1/plans trên server).
 * Dữ liệu lưu trong localStorage của trình duyệt, nên mỗi trình duyệt là một "thế giới" riêng
 * và người dùng hiện tại luôn có id FAKE_CURRENT_USER_ID.
 * Mỗi hàm trả Promise và ném Error giống một REST call, để khi có backend thật
 * chỉ cần đổi fetcher trong features/plans/api sang `api.get/post...`.
 */

export const FAKE_CURRENT_USER_ID = 'me'

const STORAGE_KEY = 'fake-plans-db:v1'
const DELAY_MS = 250

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const daysFromNow = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const task = (title, completed = false) => ({ _id: createId(), title, completed })

const member = (_id, name, email, role) => ({ _id, name, email, role })

const ME = member(FAKE_CURRENT_USER_ID, 'You', '', 'owner')

const createSeed = () => [
  {
    _id: createId(),
    title: 'Trip to Da Lat',
    description: 'Three days of pine forests, coffee and night markets.',
    color: 'forest',
    ownerId: FAKE_CURRENT_USER_ID,
    ownerName: 'You',
    visibility: 'shared',
    allowDuplicate: false,
    dueDate: daysFromNow(21),
    savedByMe: false,
    saveCount: 0,
    members: [
      ME,
      member('u-an', 'An Tran', 'an@example.com', 'editor'),
      member('u-binh', 'Binh Le', 'binh@example.com', 'viewer')
    ],
    tasks: [
      task('Book bus tickets', true),
      task('Reserve homestay', true),
      task('Plan day 1 route'),
      task('Pack warm clothes'),
      task('Buy travel insurance')
    ]
  },
  {
    _id: createId(),
    title: 'Morning routine',
    description: 'Small habits that make the day start right.',
    color: 'sun',
    ownerId: FAKE_CURRENT_USER_ID,
    ownerName: 'You',
    visibility: 'private',
    allowDuplicate: false,
    dueDate: null,
    savedByMe: false,
    saveCount: 0,
    members: [ME],
    tasks: [
      task('Drink a glass of water', true),
      task('10 minutes stretching'),
      task('Read 5 pages')
    ]
  },
  {
    _id: createId(),
    title: 'Product launch',
    description: 'Ship v1 of the landing page and onboarding emails.',
    color: 'ocean',
    ownerId: 'u-chi',
    ownerName: 'Chi Pham',
    visibility: 'shared',
    allowDuplicate: false,
    dueDate: daysFromNow(10),
    savedByMe: false,
    saveCount: 0,
    members: [
      member('u-chi', 'Chi Pham', 'chi@example.com', 'owner'),
      { ...ME, role: 'editor' },
      member('u-an', 'An Tran', 'an@example.com', 'viewer')
    ],
    tasks: [
      task('Write launch copy', true),
      task('Design hero section', true),
      task('Set up analytics'),
      task('Draft onboarding emails')
    ]
  },
  {
    _id: createId(),
    title: 'IELTS in 90 days',
    description: 'A daily plan from band 5.5 to 7.0: listening, reading, writing and speaking.',
    color: 'berry',
    ownerId: 'u-minh',
    ownerName: 'Minh Nguyen',
    visibility: 'public',
    allowDuplicate: true,
    dueDate: daysFromNow(90),
    savedByMe: false,
    saveCount: 1200,
    members: [member('u-minh', 'Minh Nguyen', 'minh@example.com', 'owner')],
    tasks: [
      task('Take a diagnostic test', true),
      task('Learn 20 new words a day', true),
      task('Listening practice: Cambridge 15'),
      task('Write one Task 2 essay per week'),
      task('Record a speaking answer daily')
    ]
  },
  {
    _id: createId(),
    title: 'Wedding preparation',
    description: 'Venue, guests, photos and everything in between.',
    color: 'rose',
    ownerId: 'u-dung',
    ownerName: 'Dung Vo',
    visibility: 'public',
    allowDuplicate: true,
    dueDate: daysFromNow(120),
    savedByMe: false,
    saveCount: 340,
    members: [member('u-dung', 'Dung Vo', 'dung@example.com', 'owner')],
    tasks: [
      task('Set the budget'),
      task('Shortlist three venues'),
      task('Draft the guest list')
    ]
  }
]

// Bộ nhớ dự phòng khi localStorage bị chặn (private window, site data bị xoá...)
let memoryDb = null

const readDb = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // localStorage không dùng được: rơi xuống memoryDb
  }
  if (!memoryDb) memoryDb = createSeed()
  writeDb(memoryDb)
  return memoryDb
}

const writeDb = (plans) => {
  memoryDb = plans
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
  } catch {
    // Giữ trong memoryDb
  }
}

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS))

const notFound = () => {
  throw new Error('Plan not found')
}

const getRole = (plan) =>
  plan.members.find((item) => item._id === FAKE_CURRENT_USER_ID)?.role || null

// Người lạ chỉ thấy plan public; không thấy email thành viên
const canView = (plan) => plan.visibility === 'public' || Boolean(getRole(plan))

const toClient = (plan) => {
  const myRole = getRole(plan)
  return {
    ...plan,
    myRole,
    members: myRole ? plan.members : plan.members.map((item) => ({ ...item, email: undefined }))
  }
}

const findPlan = (plans, planId) => {
  const plan = plans.find((item) => item._id === planId)
  if (!plan || !canView(plan)) notFound()
  return plan
}

const assertRole = (plan, roles) => {
  if (!roles.includes(getRole(plan))) {
    throw new Error('You do not have permission to do this')
  }
}

const mutatePlan = async (planId, roles, mutate) => {
  const plans = readDb()
  const plan = findPlan(plans, planId)
  assertRole(plan, roles)
  mutate(plan)
  writeDb(plans)
  return delay(toClient(plan))
}

const VIEW_FILTERS = {
  mine: (plan) => plan.ownerId === FAKE_CURRENT_USER_ID,
  shared: (plan) => plan.ownerId !== FAKE_CURRENT_USER_ID && Boolean(getRole(plan)),
  discover: (plan) => plan.visibility === 'public' && plan.ownerId !== FAKE_CURRENT_USER_ID,
  saved: (plan) => plan.savedByMe && canView(plan)
}

const EDIT_ROLES = ['owner', 'editor']
const OWNER_ROLES = ['owner']

export const fakePlansDb = {
  listPlans: async ({ view = 'mine' } = {}) => {
    const filter = VIEW_FILTERS[view] || VIEW_FILTERS.mine
    return delay(readDb().filter(filter).map(toClient))
  },

  getPlan: async (planId) => delay(toClient(findPlan(readDb(), planId))),

  createPlan: async ({ title, description = '', color, visibility, dueDate = null, tasks = [], ownerName }) => {
    const plans = readDb()
    const plan = {
      _id: createId(),
      title,
      description,
      color,
      ownerId: FAKE_CURRENT_USER_ID,
      ownerName,
      visibility,
      allowDuplicate: false,
      dueDate,
      savedByMe: false,
      saveCount: 0,
      members: [ME],
      tasks: tasks.map((title) => task(title))
    }
    writeDb([plan, ...plans])
    return delay(toClient(plan))
  },

  updatePlan: (planId, patch) =>
    mutatePlan(planId, OWNER_ROLES, (plan) => {
      Object.assign(plan, patch)
      if (plan.visibility !== 'public') plan.allowDuplicate = false
    }),

  // "Use this plan": bản sao riêng tư, task chưa hoàn thành
  duplicatePlan: async (planId, { ownerName }) => {
    const source = findPlan(readDb(), planId)
    if (!getRole(source) && !source.allowDuplicate) {
      throw new Error('The owner does not allow duplicating this plan')
    }
    return fakePlansDb.createPlan({
      title: source.title,
      description: source.description,
      color: source.color,
      visibility: 'private',
      dueDate: source.dueDate,
      tasks: source.tasks.map((item) => item.title),
      ownerName
    })
  },

  toggleSavePlan: async (planId) => {
    const plans = readDb()
    const plan = findPlan(plans, planId)
    plan.savedByMe = !plan.savedByMe
    plan.saveCount += plan.savedByMe ? 1 : -1
    writeDb(plans)
    return delay(toClient(plan))
  },

  inviteMember: (planId, { email, role }) =>
    mutatePlan(planId, OWNER_ROLES, (plan) => {
      const normalizedEmail = email.trim().toLowerCase()
      if (plan.members.some((item) => item.email === normalizedEmail)) {
        throw new Error('This person is already in the plan')
      }
      plan.members.push(member(createId(), normalizedEmail.split('@')[0], normalizedEmail, role))
      // Mời người khác vào plan private thì plan thành shared
      if (plan.visibility === 'private') plan.visibility = 'shared'
    }),

  removeMember: (planId, memberId) =>
    mutatePlan(planId, OWNER_ROLES, (plan) => {
      plan.members = plan.members.filter((item) => item._id !== memberId || item.role === 'owner')
    }),

  createTask: (planId, { title }) =>
    mutatePlan(planId, EDIT_ROLES, (plan) => {
      plan.tasks.push(task(title))
    }),

  toggleTask: (planId, taskId) =>
    mutatePlan(planId, EDIT_ROLES, (plan) => {
      plan.tasks = plan.tasks.map((item) =>
        item._id === taskId ? { ...item, completed: !item.completed } : item
      )
    }),

  deleteTask: (planId, taskId) =>
    mutatePlan(planId, EDIT_ROLES, (plan) => {
      plan.tasks = plan.tasks.filter((item) => item._id !== taskId)
    }),

  clearCompletedTasks: (planId) =>
    mutatePlan(planId, EDIT_ROLES, (plan) => {
      plan.tasks = plan.tasks.filter((item) => !item.completed)
    })
}
