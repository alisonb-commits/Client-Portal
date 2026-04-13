# ClientPortal

A full-stack client management dashboard built as a portfolio project. Manage clients, track projects, and monitor progress through a clean, Notion-inspired interface.

**Live demo:** https://client-portal-six-phi.vercel.app

---

## Features

- **Authentication** — JWT-based register/login with protected routes and persistent sessions
- **Dashboard** — Overview of clients, projects, and active work at a glance
- **Client management** — Full CRUD with search, status filtering, and project counts
- **Project management** — Track projects by status (pending, active, completed) linked to clients
- **Profile settings** — Update display name and change password
- **Responsive** — Works on mobile and desktop
- **Security** — Rate limiting on auth routes, bcrypt password hashing, helmet headers

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JSON Web Tokens (JWT) |
| Deployment | Vercel (frontend), Render (backend + DB) |

---

## Project structure

```
client-portal/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection, env validation
│   │   ├── controllers/   # Route logic
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/        # SQL query functions
│   │   └── routes/        # Express route definitions
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/           # Axios instance and interceptors
        ├── components/    # Reusable UI (Layout, ProtectedRoute)
        ├── context/       # Auth context
        ├── hooks/         # Custom hooks
        └── pages/         # Login, Register, Dashboard, Clients, Projects, Profile
```

---

## Running locally

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/client_portal
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
```

Create the database and run migrations:

```bash
psql -U postgres -c "CREATE DATABASE client_portal;"
psql -U postgres -d client_portal -f src/config/migrations/001_initial_schema.sql
```

Start the server:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to `http://localhost:5000` in development.

---

## API endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| PUT | `/api/auth/profile` | Update name or password |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all clients |
| GET | `/api/clients/:id` | Get one client |
| POST | `/api/clients` | Create client |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get one project |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

All client and project routes require a `Bearer` token in the `Authorization` header.

---

## Deployment

- **Frontend** deployed on [Vercel](https://vercel.com) with `frontend/` as the root directory
- **Backend** deployed on [Render](https://render.com) with `backend/` as the root directory
- **Database** hosted on Render's managed PostgreSQL (free tier)
