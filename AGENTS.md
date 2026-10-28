# AGENTS.md

Daily days is a React + Vite SPA: users sign up (email/OTP or Google), manage a to-do list, add friends, chat in real time and receive notifications. The backend is a separate REST + Socket.IO server.

The source layout follows the [Bulletproof React](https://github.com/alan2207/bulletproof-react) architecture, adapted to this project's stack. Don't introduce libraries from Bulletproof that this project does not use (TypeScript, Tailwind, Zustand, Zod, MSW...).

| Concern | Library |
|---|---|
| Build / dev server | Vite 7 (`@vitejs/plugin-react-swc`), plain JavaScript (`.js` / `.jsx`) |
| Routing | React Router 7 (`createBrowserRouter`) |
| UI | MUI 7 + plain CSS files per component, icons from Font Awesome |
| Server data | TanStack Query 5 |
| Client state | Redux Toolkit + redux-persist |
| Forms | React Hook Form + yup |
| HTTP | axios (`lib/api-client.js`) |
| Realtime | socket.io-client (`lib/socket.js`) |
| Toasts | react-toastify |

## Commands

```bash
npm ci              # package-lock.json is the lockfile that installs cleanly
npm run dev         # vite --host
npm run build
npm run lint        # ESLint, also enforces the architecture rules below
npm run preview
```

Copy `.env.example` to `.env` before running. Env vars are read in `src/config/env.js`.

**Before reporting work as done, run `npm run lint` and `npm run build`.** There is no test runner and no type-check yet.

## Source layout (`src/`)

```
app/            application layer: composes features into pages
  index.jsx       <App>: socket lifecycle, RouterProvider, ToastContainer
  provider.jsx    <AppProvider>: Google OAuth, Redux, PersistGate, QueryClient
  router.jsx      route table (paths come from config/paths.js)
  routes/         one file per page (auth/login.jsx, home.jsx, chat.jsx, profile.jsx...)
  layouts/        layouts that compose features (default-layout + app-header)
  use-global-socket-subscriptions.js   socket events that update several features' caches
components/     shared UI with no business logic
  ui/             design-system components (custom-button, custom-avatar, otp, text...)
  layouts/        layouts with no feature dependencies (auth-card-layout, simple-card-layout)
config/         env.js, paths.js (route paths + getHref helpers)
features/       auth, chat, friends, notifications, todos, users
hooks/          shared hooks (use-debounce)
lib/            api-client, auth (login/logout/refresh), react-query, socket, token-storage, store/ (Redux)
testing/        fake data for demos (fake-api.js)
utils/          constants (socket event names), get-avatar-src, get-error-message
styles/         global.css
```

Features contain `api/` and `components/`. Add another folder only when a feature actually needs it (e.g. `features/chat/hooks/use-messages.js`); don't create empty ones.

## Architecture rules (enforced by ESLint `no-restricted-imports`)

- **No cross-feature imports**: `features/a` must not import from `features/b`. Combine features in `src/app` (e.g. `app/routes/profile.jsx` combines users and friends; `app/layouts/default-layout` combines notifications, users search and friends).
- **Unidirectional imports**: `shared (components, config, hooks, lib, utils, testing) → features → app`. Features cannot import from `app`; shared code cannot import from `features` or `app`.
- Use `@/` absolute imports for anything in `src`. The alias is defined twice and both must stay in sync: `vite.config.js` (build) and `jsconfig.json` (editor). Parent-relative imports (`../`) are rejected; `./x.css` next to a component is fine.
- File and folder names are kebab-case. Component names stay PascalCase (`custom-button.jsx` exports `CustomButton`). Shared components keep the `custom-` prefix where the plain name would collide with MUI (`Button`, `Avatar`, `TextField`, `Checkbox`).
- Features have no barrel files: import the file directly (`@/features/chat/api/get-messages`). Shared components in `components/ui` and `components/layouts` each have an `index.js` (`@/components/ui/custom-button`).
- Navigate with `paths` from `@/config/paths` (`paths.app.profile.getHref(id)`), never a hand-written URL.

## API layer

One file per endpoint in `features/<feature>/api/<verb>-<resource>.js`. Copy an existing file rather than inventing a new shape:

- Query: `features/todos/api/get-todos.js`
- Infinite query: `features/chat/api/get-messages.js`
- Mutation: `features/todos/api/create-todo.js`
- Mutation with optimistic cache update: `features/notifications/api/delete-notification.js`

Each file contains, in order:

1. For form inputs: a yup schema (`registerInputSchema`, `resetPasswordInputSchema`). The form uses the same schema through `yupResolver`.
2. A plain fetcher using `api` from `@/lib/api-client`, usable outside React.
3. For queries: `get<X>QueryOptions()` built with `queryOptions()` / `infiniteQueryOptions()`. It is the only place the query key is defined.
4. A hook (`useTodos`, `useCreateTodo`) taking an options object: `{ ...params, queryConfig }` or `{ mutationConfig }`.

Mutations invalidate through query options (`getTodosQueryOptions().queryKey`), never a hand-written key. They destructure `onSuccess` from `mutationConfig` and call it after their own cache work, so callers can add behaviour (e.g. the profile page also invalidates the viewed user).

Exceptions:
- `lib/auth.js` holds login / login with Google / logout / refresh token, because Redux (`lib/store/user-slice.js`), the axios interceptor and the socket all depend on them.
- The auth form flows (register, OTP, forgot/reset password) call their fetchers directly, not through `useMutation`: the global `retry: 1` for mutations in `lib/react-query.js` would otherwise resend OTP/registration requests.

### Realtime (Socket.IO)

- `lib/socket.js` owns the connection: `initSocket`, `disconnectSocket`, `subscribeToEvent`, `emitEvent`, and re-joins conversation rooms after every reconnect. Event names are in `utils/constants.js`.
- User actions (send / accept friend request, etc.) go through a REST mutation, not a socket emit: a mutation gives success/error, `isPending` and the token-refresh interceptor. Sockets are for hearing what the *other* user did. Backend contract: `my_daily_project_api/docs/FRIENDS_API.md`.
- Each feature wraps its own events in `features/<feature>/api/<name>-socket.js` (`message-socket.js`, `friend-socket.js`, `notification-socket.js`). `subscribeTo*` functions return an unsubscribe function.
- Subscriptions that only touch one feature's cache live in that feature as a hook (`features/notifications/hooks/use-notification-subscriptions.js`, `features/friends/hooks/use-friend-status-subscriptions.js`), with the cache helper next to the query options (`prependNotificationToCache`, `setFriendsOnlineStatus`).
- `app/use-global-socket-subscriptions.js` calls those hooks and handles only the events that touch several features' caches. Keep it that way so it doesn't grow with every feature.
- Read Redux state that a handler needs at event time (`useStore().getState()`) instead of adding it to the effect's deps, otherwise every change unsubscribes and resubscribes.

## State

| Kind | Tool | Where |
|---|---|---|
| Server data | TanStack Query | `features/*/api` |
| Current user (persisted) | Redux `user` slice | `lib/store/user-slice.js` (`selectCurrentUser`, `loginUserAPI`, `logoutUserAPI`...) |
| Global UI / socket state | Redux `sidebar`, `socket` slices | `lib/store/*-slice.js` |
| Tokens | localStorage / sessionStorage | `lib/token-storage.js` (see its header comment for why not cookies) |
| Forms | React Hook Form + yup | in the feature component |
| Local | `useState` | in the component |

Don't copy server data into Redux or local state. Socket updates write into the same query cache the REST data lives in (`appendMessageToCache`, `setFriendsOnlineStatus`, `prependNotificationToCache`), so each piece of data has one source. Forms seeded from a query use React Hook Form's `values` (with `resetOptions: { keepDirtyValues: true }`), not a `useEffect` that copies into `useState`. Add a Redux slice only for genuinely global client state, and register it in `lib/store/index.js`.

## Checklist: adding an endpoint

1. Create `features/<feature>/api/<name>.js` following the pattern above.
2. Use the hook in a feature component.
3. Compose the component into a page under `src/app/routes`, adding the path to `config/paths.js` and the route to `app/router.jsx` if it is a new page.
4. Run `npm run lint` and `npm run build`.
