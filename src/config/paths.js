export const paths = {
  home: {
    path: '/',
    // view: mục của Plan Workspace (mine | shared | discover | saved), mặc định mine
    getHref: (view) => (view && view !== 'mine' ? `/?view=${view}` : '/')
  },

  auth: {
    login: {
      path: '/login',
      getHref: (verifyEmail) =>
        verifyEmail ? `/login?verifyEmail=${encodeURIComponent(verifyEmail)}` : '/login'
    },
    register: {
      path: '/signup',
      getHref: () => '/signup'
    },
    accountVerification: {
      path: '/account/verification',
      getHref: (email) => `/account/verification?email=${encodeURIComponent(email)}`
    },
    forgotPassword: {
      path: '/forgot-password',
      getHref: () => '/forgot-password'
    }
  },

  app: {
    plan: {
      path: '/plans/:planId',
      getHref: (planId) => `/plans/${planId}`
    },
    // Link mời do server sinh: `${WEBSITE_DOMAIN}/plans/join/<token>`
    planJoin: {
      path: '/plans/join/:token',
      getHref: (token) => `/plans/join/${token}`
    },
    profile: {
      path: '/profile/:id',
      getHref: (id) => `/profile/${id}`
    },
    chat: {
      path: '/chat/:userId',
      getHref: (userId) => `/chat/${userId}`
    },
    problemDemo: {
      path: '/problem-demo',
      getHref: () => '/problem-demo'
    }
  },

  notFound: {
    path: '/404',
    getHref: () => '/404'
  }
}
