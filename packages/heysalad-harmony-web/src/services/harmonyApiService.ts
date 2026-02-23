import { Worker, WorkSession, WorkerMetrics, WorkforceSummary, CostBreakdown } from '../types';

const API_URL = import.meta.env.VITE_HARMONY_API_URL || 'https://harmony-api.heysalad-o.workers.dev';

async function apiCall<T>(method: string, path: string, body?: any): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((error as any).error || 'API request failed');
  }

  return response.json() as Promise<T>;
}

// Workers API
export const workersApi = {
  list(filters?: { company_id?: string; worker_type?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.company_id) params.set('company_id', filters.company_id);
    if (filters?.worker_type) params.set('worker_type', filters.worker_type);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return apiCall<{ workers: Worker[] }>('GET', `/api/workers${qs ? `?${qs}` : ''}`);
  },

  get(id: string) {
    return apiCall<{ worker: Worker }>('GET', `/api/workers/${id}`);
  },

  create(worker: Partial<Worker>) {
    return apiCall<{ worker: Worker }>('POST', '/api/workers', worker);
  },

  update(id: string, updates: Partial<Worker>) {
    return apiCall<{ worker: Worker }>('PUT', `/api/workers/${id}`, updates);
  },

  deactivate(id: string) {
    return apiCall<{ worker: Worker }>('DELETE', `/api/workers/${id}`);
  },

  getMetrics(id: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return apiCall<{ worker: Worker; metrics: WorkerMetrics[] }>(
      'GET', `/api/workers/${id}/metrics${qs ? `?${qs}` : ''}`,
    );
  },
};

// Sessions API
export const sessionsApi = {
  start(data: { worker_id: string; task_id?: string; task_description?: string; location?: string; shift_type?: string }) {
    return apiCall<{ session: WorkSession }>('POST', '/api/sessions/start', data);
  },

  end(id: string, metrics?: Record<string, any>) {
    return apiCall<{ session: WorkSession }>('POST', `/api/sessions/${id}/end`, metrics || {});
  },

  heartbeat(id: string, metrics: Record<string, any>) {
    return apiCall<{ session: WorkSession }>('POST', `/api/sessions/${id}/heartbeat`, metrics);
  },

  list(filters?: { worker_id?: string; company_id?: string; worker_type?: string; status?: string; start_date?: string; end_date?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    }
    const qs = params.toString();
    return apiCall<{ sessions: WorkSession[] }>('GET', `/api/sessions${qs ? `?${qs}` : ''}`);
  },

  get(id: string) {
    return apiCall<{ session: WorkSession }>('GET', `/api/sessions/${id}`);
  },
};

// Analytics API
export const analyticsApi = {
  workforce(companyId: string) {
    return apiCall<{ summary: WorkforceSummary }>('GET', `/api/analytics/workforce?company_id=${companyId}`);
  },

  costs(companyId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ company_id: companyId });
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    return apiCall<{ breakdown: CostBreakdown[]; period: { start: string; end: string } }>(
      'GET', `/api/analytics/costs?${params}`,
    );
  },

  runtime(companyId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ company_id: companyId });
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    return apiCall<{ analytics: any[]; period: { start: string; end: string } }>(
      'GET', `/api/analytics/runtime?${params}`,
    );
  },
};
