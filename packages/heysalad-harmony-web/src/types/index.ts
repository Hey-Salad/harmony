export type Role = 'HR Manager' | 'Operations Manager' | 'Warehouse Staff';

export type PackageType = 
  | 'onboarding'
  | 'visa'
  | 'pay'
  | 'bonus'
  | 'learning'
  | 'wellbeing';

export type VisaType = 
  | 'service-provider'
  | 'blue-card'
  | 'chancenkarte'
  | 'self-employed'
  | 'intra-company-transfer';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface PackageTypeOption {
  type: PackageType;
  title: string;
  description: string;
  icon: string;
  available: boolean;
}

// Unified Worker types

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
  first_name?: string;
  last_name?: string;
  phone?: string;
  salary?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  heysalad_user_id?: string;
  capabilities?: string[];
  model_name?: string;
  version?: string;
  cost_per_hour?: number;
  agent_config?: Record<string, any>;
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
  location?: string;
  shift_type?: string;
  task_id?: string;
  task_description?: string;
  tokens_input?: number;
  tokens_output?: number;
  api_calls_count?: number;
  cost_incurred?: number;
  model_version?: string;
  error_count?: number;
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