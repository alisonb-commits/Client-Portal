-- Users table
CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role      VARCHAR(20) NOT NULL DEFAULT 'user',  -- 'admin' or 'user'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255),
  company    VARCHAR(100),
  status     VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active' or 'inactive'
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'active', 'completed'
  client_id   INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
