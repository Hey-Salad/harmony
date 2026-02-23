// HeySalad Harmony API Types

export interface Env {
  DB: D1Database;
  HEYSALAD_OAUTH_CLIENT_ID: string;
  HEYSALAD_OAUTH_CLIENT_SECRET: string;
  OPENAI_API_KEY: string;
  GOOGLE_API_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  TAVILY_API_KEY: string;
  BROWSERLESS_API_KEY: string;
}

export interface Company {
  id: string;
  name: string;
  registration_number?: string;
  country: string;
  heysalad_account_id: string;
  created_at: number;
  updated_at: number;
}

export interface Employee {
  id: string;
  company_id: string;
  heysalad_user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role: string;
  department?: string;
  salary?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'terminated';
  created_at: number;
  updated_at: number;
}

export interface Document {
  id: string;
  employee_id: string;
  type: 'contract' | 'offer_letter' | 'termination' | 'amendment';
  title: string;
  content: string;
  metadata?: Record<string, any>;
  generated_by?: string;
  generated_at: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, any>;
  timestamp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  heysalad_account_id: string;
}

// Unified Worker types (humans + AI agents)

export type WorkerType = 'human' | 'ai';
export type WorkerStatus = 'active' | 'idle' | 'offline' | 'inactive' | 'terminated';
export type SessionStatus = 'in_progress' | 'completed' | 'failed' | 'abandoned';

export interface Worker {
  id: string;
  company_id: string;
  worker_type: WorkerType;
  name: string;
  email?: string;
  status: WorkerStatus;
  role: string;
  department?: string;
  // Human fields
  first_name?: string;
  last_name?: string;
  phone?: string;
  salary?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  heysalad_user_id?: string;
  // AI agent fields
  capabilities?: string[];
  model_name?: string;
  version?: string;
  cost_per_hour?: number;
  agent_config?: Record<string, any>;
  // Timestamps
  created_at: number;
  updated_at: number;
  last_active_at?: number;
  metadata?: Record<string, any>;
}

export interface WorkSession {
  id: string;
  worker_id: string;
  worker_type: WorkerType;
  company_id: string;
  start_time: number;
  end_time?: number;
  duration_seconds?: number;
  // Human fields
  location?: string;
  shift_type?: string;
  // AI agent fields
  task_id?: string;
  task_description?: string;
  tokens_input?: number;
  tokens_output?: number;
  api_calls_count?: number;
  cost_incurred?: number;
  model_version?: string;
  error_count?: number;
  // Common
  status: SessionStatus;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: number;
}

export interface WorkerMetrics {
  id: string;
  worker_id: string;
  worker_type: WorkerType;
  company_id: string;
  date: string;
  total_duration_seconds: number;
  sessions_count: number;
  total_tokens_input: number;
  total_tokens_output: number;
  total_api_calls: number;
  total_cost: number;
  tasks_completed: number;
  error_count: number;
}

export interface RuntimeMetrics {
  tokens_input?: number;
  tokens_output?: number;
  api_calls_count?: number;
  cost_incurred?: number;
  error_count?: number;
}

export interface WorkforceSummary {
  total_workers: number;
  active_humans: number;
  active_agents: number;
  idle_agents: number;
  total_cost_today: number;
  total_sessions_today: number;
}

export interface CostBreakdown {
  period: string;
  human_costs: number;
  agent_costs: number;
  total_cost: number;
  human_hours: number;
  agent_hours: number;
}
