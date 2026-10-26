export const paths = {
  home: {
    path: '/',
    getHref: () => '/'
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
