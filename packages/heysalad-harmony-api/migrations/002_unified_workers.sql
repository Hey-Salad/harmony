-- HeySalad Harmony - Unified Workers Migration
-- Version: 2.0.0
-- Adds unified workers table (humans + AI agents), work sessions, and metrics

-- Unified workers table (humans + AI agents)
CREATE TABLE workers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  worker_type TEXT NOT NULL CHECK(worker_type IN ('human', 'ai')),
  name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL CHECK(status IN ('active', 'idle', 'offline', 'inactive', 'terminated')),
  role TEXT NOT NULL,
  department TEXT,
  -- Human-specific fields
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  salary REAL,
  currency TEXT DEFAULT 'EUR',
  start_date TEXT,
  end_date TEXT,
  heysalad_user_id TEXT,
  -- AI agent-specific fields
  capabilities TEXT,      -- JSON array: ["shopping","delivery"]
  model_name TEXT,        -- "gemini-2.5-flash", "claude-sonnet"
  version TEXT,
  cost_per_hour REAL,
  agent_config TEXT,      -- JSON: ADK config, MCP servers, etc.
  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  last_active_at INTEGER,
  metadata TEXT,          -- JSON extensibility
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_workers_company ON workers(company_id);
CREATE INDEX idx_workers_type ON workers(worker_type);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_workers_company_type ON workers(company_id, worker_type);

-- Work sessions (human shifts + agent runtime in one table)
CREATE TABLE work_sessions (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  worker_type TEXT NOT NULL,
  company_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  duration_seconds INTEGER,
  -- Human-specific fields
  location TEXT,
  shift_type TEXT,
  -- AI agent-specific fields
  task_id TEXT,
  task_description TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  api_calls_count INTEGER,
  cost_incurred REAL,
  model_version TEXT,
  error_count INTEGER DEFAULT 0,
  -- Common fields
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'failed', 'abandoned')),
  notes TEXT,
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_worker ON work_sessions(worker_id);
CREATE INDEX idx_sessions_company ON work_sessions(company_id);
CREATE INDEX idx_sessions_status ON work_sessions(status);
CREATE INDEX idx_sessions_start ON work_sessions(start_time);
CREATE INDEX idx_sessions_worker_type ON work_sessions(worker_type);

-- Daily aggregated metrics
CREATE TABLE worker_metrics (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  worker_type TEXT NOT NULL,
  company_id TEXT NOT NULL,
  date TEXT NOT NULL,
  total_duration_seconds INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  total_tokens_input INTEGER DEFAULT 0,
  total_tokens_output INTEGER DEFAULT 0,
  total_api_calls INTEGER DEFAULT 0,
  total_cost REAL DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  UNIQUE(worker_id, date)
);

CREATE INDEX idx_metrics_worker ON worker_metrics(worker_id);
CREATE INDEX idx_metrics_company ON worker_metrics(company_id);
CREATE INDEX idx_metrics_date ON worker_metrics(date);
CREATE INDEX idx_metrics_worker_date ON worker_metrics(worker_id, date);
