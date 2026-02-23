export interface HarmonyTrackerConfig {
  agentId: string;
  apiKey: string;
  apiUrl: string;
  modelName?: string;
  flushIntervalMs?: number;
}

export interface RuntimeMetrics {
  tokens_input?: number;
  tokens_output?: number;
  api_calls_count?: number;
  cost_incurred?: number;
  error_count?: number;
}

export interface SessionInfo {
  id: string;
  worker_id: string;
  worker_type: string;
  company_id: string;
  start_time: number;
  status: string;
  task_id?: string;
  task_description?: string;
}

export interface ADKEvent {
  usage_metadata?: {
    prompt_token_count?: number;
    candidates_token_count?: number;
    total_token_count?: number;
  };
  [key: string]: any;
}
