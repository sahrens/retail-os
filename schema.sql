-- RetailOS Schema
-- Auth tables

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member',  -- 'admin', 'member'
  status TEXT NOT NULL DEFAULT 'invited', -- 'invited', 'active'
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
