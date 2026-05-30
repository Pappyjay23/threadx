<div align="center">
  <h1>💬 ThreadX</h1>
  <p><strong>Real-time messaging — direct chats, group conversations, and everything in between.</strong></p>
</div>

## 🌟 Overview

**ThreadX** is a full-stack real-time messaging application built for seamless one-on-one and group conversations. Users sign up (or continue with Google), and immediately get access to a conversation-centric workspace: Direct chats, group rooms with admin controls, image sharing, message replies, pinned chats, and live typing indicators—all streaming over WebSocket in real time. The app pairs a fast React SPA with a secure Express API backed by MongoDB, using JWT access tokens, httpOnly refresh cookies, automatic token refresh, and Arcjet-powered security on every endpoint.

## Snapshot 📸


## 🛠 Tech Stack

### Frontend

- [React 19](https://react.dev) – UI with function components and hooks.
- [Vite 7](https://vitejs.dev/) – Lightning-fast dev server and production builds.
- [TypeScript](https://www.typescriptlang.org/) – Typed components, stores, and API layer.
- [Tailwind CSS v4](https://tailwindcss.com/) – Utility-first styling.
- [React Router v7](https://reactrouter.com/) – Public vs. protected routes.
- [Zustand](https://zustand-demo.pmnd.rs/) – Lightweight global state for auth and chat.
- [TanStack Query](https://tanstack.com/query) – Server-state management and caching.
- [Axios](https://axios-http.com/) – HTTP client with `Authorization` headers and refresh-retry interceptor.
- [Socket.IO Client](https://socket.io/) – Real-time bidirectional messaging.
- [Zod](https://zod.dev/) – Client-side schema validation.
- [Emoji Picker React](https://github.com/ealush/emoji-picker-react) – In-chat emoji selection.
- [React Markdown](https://github.com/remarkjs/react-markdown) – Render markdown-formatted messages.
- [Sonner](https://sonner.emilkowal.ski/) – Toast notifications.
- [React Icons](https://react-icons.github.io/react-icons/) – Icon set.
- [Google OAuth (`@react-oauth/google`)](https://github.com/MomenSherif/react-oauth) – One-tap Google sign-in.
- **PWA** – Installable, offline-capable via `vite-plugin-pwa` and Workbox.

### Backend

- [Node.js](https://nodejs.org/) – Runtime.
- [Express 5](https://expressjs.com/) – REST API (`/api/auth`, `/api/user`, `/api/messages`).
- [TypeScript](https://www.typescriptlang.org/) – Typed controllers, models, and middleware.
- [Socket.IO](https://socket.io/) – Real-time event server (online presence, typing indicators, message broadcast).
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) – User, Conversation, Message, and token persistence.
- [JWT](https://jwt.io/) – Short-lived access tokens; refresh tokens stored server-side and in httpOnly cookies.
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) – Password hashing.
- [Zod](https://zod.dev/) – Request body validation on create/update flows.
- [Arcjet](https://arcjet.com/) – Bot detection, shield protection, and sliding-window rate limiting on every route (`@arcjet/node`).
- [Cloudinary](https://cloudinary.com/) – Signed upload and storage for profile pictures and message images.
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs) – Server-side Google ID token verification.
- [Nodemailer](https://nodemailer.com/) + [Resend](https://resend.com/) – Transactional email for password-reset flows.
- [cookie-parser](https://github.com/expressjs/cookie-parser) & [cors](https://github.com/expressjs/cors) – Cookies and cross-origin configuration for the SPA.

## 🚀 Key Features

- **Authentication** – Email/password sign-up and login, plus one-tap **Google OAuth**. Access token stored in a cookie; refresh token in an httpOnly cookie.
- **Forgot / Reset Password** – Secure email-based password reset with time-limited tokens.
- **Session resilience** – Axios interceptor calls `/auth/refresh` on 401 and retries the original request; Socket.IO reconnects and re-authenticates transparently.
- **Direct Messaging** – One-on-one conversations with a persistent conversation thread.
- **Group Chats** – Create named groups with a custom avatar, add/remove members, leave, or delete the group entirely.
- **Message Replies** – Reply to any message with a linked preview; scroll-to-original on click.
- **Image Sharing** – Send images in chat via direct Cloudinary upload with signed URL.
- **Optimistic UI** – Messages are added to the local store immediately with a temporary ID. Once the server confirms, the temp entry is swapped for the real document. On failure the temp message is rolled back and an error toast is shown.
- **Unread Counts & Mark as Read** – Per-conversation unread badge that clears when the chat is opened.
- **Pin Chats** – Pin important conversations to the top of the chat list (per user).
- **Real-time Typing Indicators** – Live "…is typing" broadcast to all participants in a conversation.
- **Online Presence** – Live online user list pushed to all connected clients over WebSocket.
- **Delete Messages** – Only the sender can delete their own messages; the image is removed from Cloudinary before the document is deleted, and unread counts are reconciled across all participants.
- **Chat Deletion (soft-delete)** – Deleting a direct chat sets a per-user `hidden` flag on the Conversation document rather than removing any data. The conversation reappears automatically if a new message is sent. Group deletion (admin only) is a hard delete — all messages and Cloudinary assets are purged before the conversation document is destroyed.
- **Profile Management** – Upload a profile picture via Cloudinary signed upload.
- **Sound Notifications** – Toggleable in-app sound on incoming messages.
- **PWA Support** – Installable on desktop and mobile; service worker for offline readiness.
- **Security** – Arcjet shield, bot detection, and per-IP rate limiting on auth routes (10 req/min) and general API routes (100 req/min).

## 📁 Project Structure

```
threadx/
├── backend/          # Express API, Socket.IO server
│   └── src/
│       ├── config/       # DB, socket, arcjet, env, cloudinary
│       ├── controllers/  # auth, user, message
│       ├── middlewares/  # auth, arcjet, origin, socket-auth
│       ├── models/       # User, Conversation, Message, tokens
│       ├── routes/       # auth, user, message
│       ├── schemas/      # Zod validation schemas
│       ├── template/     # Email HTML templates
│       ├── utils/        # Helpers (token, email, etc.)
│       └── server.ts
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/          # Axios API layer (auth, user, message)
        ├── components/   # chat, navigation, shared, ui
        ├── config/       # axios instance, route config
        ├── hooks/        # Custom React hooks
        ├── pages/        # landing, auth, home, error, loading
        ├── routes/       # Route definitions & guards
        ├── schemas/      # Zod form schemas
        ├── store/        # Zustand stores (useAuthStore, useChatStore)
        ├── types/        # TypeScript interfaces
        └── utils/        # Utility functions
```

## 📡 API Routes

| Method   | Path                                      | Auth | Description                          |
| -------- | ----------------------------------------- | ---- | ------------------------------------ |
| `POST`   | `/api/auth/signup`                        | No   | Register with email & password        |
| `POST`   | `/api/auth/login`                         | No   | Login with email & password           |
| `POST`   | `/api/auth/google`                        | No   | Login / register via Google OAuth     |
| `POST`   | `/api/auth/forgot-password`               | No   | Send password-reset email             |
| `POST`   | `/api/auth/reset-password`                | No   | Reset password with token             |
| `POST`   | `/api/auth/refresh`                       | No   | Exchange refresh cookie for new token |
| `POST`   | `/api/auth/logout`                        | Yes  | Invalidate session                    |
| `GET`    | `/api/auth/upload-profile-signature`      | Yes  | Cloudinary signed upload params       |
| `PATCH`  | `/api/auth/update-profile`                | Yes  | Update profile picture URL            |
| `GET`    | `/api/user/`                              | Yes  | Get current authenticated user        |
| `GET`    | `/api/messages/contacts`                  | Yes  | Paginated contact list                |
| `GET`    | `/api/messages/chats`                     | Yes  | All conversations for current user    |
| `GET`    | `/api/messages/conversations/:id`         | Yes  | Messages by conversation ID           |
| `GET`    | `/api/messages/:id`                       | Yes  | Messages by user ID (direct chat)     |
| `POST`   | `/api/messages/:id`                       | Yes  | Send a message                        |
| `DELETE` | `/api/messages/:messageId`                | Yes  | Delete a message                      |
| `POST`   | `/api/messages/:id/read`                  | Yes  | Mark conversation as read             |
| `PATCH`  | `/api/messages/:id/pin`                   | Yes  | Toggle pin on a chat                  |
| `DELETE` | `/api/messages/chats/:id`                 | Yes  | Delete entire direct chat             |
| `POST`   | `/api/messages/groups`                    | Yes  | Create a group conversation           |
| `PATCH`  | `/api/messages/groups/:id`                | Yes  | Update group name / avatar            |
| `DELETE` | `/api/messages/groups/:id`                | Yes  | Delete group (admin only)             |
| `POST`   | `/api/messages/groups/:id/members`        | Yes  | Add members to group                  |
| `POST`   | `/api/messages/groups/:id/remove`         | Yes  | Remove a member from group            |
| `POST`   | `/api/messages/groups/:id/leave`          | Yes  | Leave a group                         |
| `GET`    | `/api/messages/upload-message-signature`  | Yes  | Cloudinary signed params for images   |
| `GET`    | `/api/messages/upload-group-avatar-signature` | Yes | Cloudinary signed params for group avatar |

## 🔌 WebSocket Events

| Event           | Direction       | Description                                      |
| --------------- | --------------- | ------------------------------------------------ |
| `getOnlineUsers`| Server → Client | Array of currently online user IDs               |
| `newMessage`    | Server → Client | Broadcast new message to conversation recipients |
| `typing:start`  | Client → Server | User started typing in a conversation            |
| `typing:stop`   | Client → Server | User stopped typing in a conversation            |
| `typing:update` | Server → Client | Typing state for a conversation participant      |
| `unreadUpdate`  | Server → Client | Updated unread count for a conversation          |
| `messagesRead`  | Server → Client | Conversation marked as read by a participant     |

## 💻 How to Run Locally

You need **Node.js** and a **MongoDB** deployment (local or Atlas). A **Cloudinary** account is required for media uploads, and **Arcjet** for security/rate limiting.

### 1. Clone the repository

```bash
git clone https://github.com/Pappyjay23/threadx.git
cd threadx
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Server
PORT=5001
NODE_ENV=development

# CORS – set to your frontend origin
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/threadx
# or your MongoDB Atlas connection string

# JWT – use long random strings in production
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
# Optional overrides (defaults: 15m access, 7d refresh)
# JWT_ACCESS_TOKEN_EXPIRES_IN=15m
# JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Arcjet (https://arcjet.com)
ARCJET_KEY=your_arcjet_key

# Email (Resend or Nodemailer SMTP)
RESEND_API_KEY=your_resend_api_key
```

Start the API:

```bash
npm run dev
```

The server listens on **http://localhost:5001** by default (`GET /health` returns a status JSON).

Production build:

```bash
npm run build
npm start
```

### 3. Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_THREADX_API_URL=http://localhost:5001/api
```

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:5173**. Make sure the backend is running first.

Production build:

```bash
npm run build
npm run preview
```

### Monorepo Layout

| Path        | Role                                                        |
| ----------- | ----------------------------------------------------------- |
| `frontend/` | React 19 + Vite 7 SPA (PWA)                                 |
| `backend/`  | Express 5 API, Socket.IO, MongoDB, Auth, Arcjet security    |

There is no root-level `package.json`; install and run each package separately.

## Credits ✍

Implementation by [Pappyjay23](https://github.com/Pappyjay23)