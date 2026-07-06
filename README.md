# quiz-app

Quizzly is a web application for running live quizzes. One person
creates a quiz and opens a room; other people join that room with a short code
and answer questions in real time from their own devices. Leaderboard is shown at the end.

## Technology stack

**Frontend**
- React (function components + hooks)
- React Router for client-side routing
- Socket.IO client for the real-time connection
- Plain fetch-based API client (`api.js`) for REST calls
- Vite as the build tool / dev server

**Backend**
- Node.js with Express for the REST API (`/auth/register`, `/auth/login`,
  `/auth/me`, `/quizzes/mine`, `/history`)
- Socket.IO server for real-time room events (creating/joining rooms,
  showing questions, collecting answers, broadcasting results)
- PostgreSQL for persistent data (users, quizzes, finished quiz sessions),
  accessed via the `pg` driver
- JSON Web Tokens (JWT) for authentication, bcrypt for password hashing

**Data model**
- `users` — id, email, password hash, display name
- `quizzes` — title, category, questions (stored as JSON), the user who
  created it
- `quiz_sessions` — a completed run of a quiz: room code, host, and the final
  list of participants with their scores (used to build each user's history)

  **Main scenarios**
  1. Registration/Login
  2. Quiz and lobby creation
  3. Connecting participants by code
  4. Quiz start and timer questions display
  5. Final leaderboard, saving to history

  **Product**
  `https://quizzly-client-0lmf.onrender.com`

