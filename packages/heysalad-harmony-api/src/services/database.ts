import { Company, Employee, Document, AuditLog, Worker, WorkSession, WorkerMetrics, RuntimeMetrics, WorkforceSummary, CostBreakdown } from '../types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  // Companies
  async createCompany(company: Omit<Company, 'created_at' | 'updated_at'>): Promise<Company> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(`
      INSERT INTO companies (id, name, registration_number, country, heysalad_account_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      company.id,
      company.name,
      company.registration_number || null,
      company.country,
      company.heysalad_account_id,
      now,
      now
    ).run();

    return { ...company, created_at: now, updated_at: now };
  }

  async getCompany(id: string): Promise<Company | null> {
    const result = await this.db.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first<Company>();
    return result || null;
  }

  async listCompanies(heysalad_account_id?: string): Promise<Company[]> {
    let query = 'SELECT * FROM companies';
    const params: any[] = [];
    
    if (heysalad_account_id) {
      query += ' WHERE heysalad_account_id = ?';
      params.push(heysalad_account_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.prepare(query).bind(...params).all<Company>();
    return result.results || [];
  }

  // Employees
  async createEmployee(employee: Omit<Employee, 'created_at' | 'updated_at'>): Promise<Employee> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(`
      INSERT INTO employees (
        id, company_id, heysalad_user_id, first_name, last_name, email, phone,
        role, department, salary, currency, start_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      employee.id,
      employee.company_id,
      employee.heysalad_user_id || null,
      employee.first_name,
      employee.last_name,
      employee.email || null,
      employee.phone || null,
      employee.role,
      employee.department || null,
      employee.salary || null,
      employee.currency,
      employee.start_date || null,
      employee.status,
      now,
      now
    ).run();

    return { ...employee, created_at: now, updated_at: now };
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const result = await this.db.prepare('SELECT * FROM employees WHERE id = ?').bind(id).first<Employee>();
    return result || null;
  }

  async listEmployees(company_id?: string, status?: string): Promise<Employee[]> {
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params: any[] = [];
    
    if (company_id) {
      query += ' AND company_id = ?';
      params.push(company_id);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.prepare(query).bind(...params).all<Employee>();
    return result.results || [];
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    const now = Math.floor(Date.now() / 1000);
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getEmployee(id);

    fields.push('updated_at = ?');
    values.push(now, id);

    await this.db.prepare(`
      UPDATE employees SET ${fields.join(', ')} WHERE id = ?
    `).bind(...values).run();

    return this.getEmployee(id);
  }

  // Documents
  async createDocument(document: Omit<Document, 'generated_at'>): Promise<Document> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(`
      INSERT INTO documents (id, employee_id, type, title, content, metadata, generated_by, generated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      document.id,
      document.employee_id,
      document.type,
      document.title,
      document.content,
      document.metadata ? JSON.stringify(document.metadata) : null,
      document.generated_by || null,
      now
    ).run();

    return { ...document, generated_at: now };
  }

  async getDocument(id: string): Promise<Document | null> {
    const result = await this.db.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first<any>();
    if (!result) return null;
    
    return {
      ...result,
      metadata: result.metadata ? JSON.parse(result.metadata) : undefined,
    };
  }

  async listDocuments(employee_id: string): Promise<Document[]> {
    const result = await this.db.prepare(
      'SELECT * FROM documents WHERE employee_id = ? ORDER BY generated_at DESC'
    ).bind(employee_id).all<any>();
    
    return (result.results || []).map(doc => ({
      ...doc,
      metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
    }));
  }

  // Audit log
  async logAction(log: Omit<AuditLog, 'timestamp'>): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(`
      INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, changes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      log.id,
      log.user_id,
      log.action,
      log.entity_type,
      log.entity_id,
      log.changes ? JSON.stringify(log.changes) : null,
      now
    ).run();
  }

  // Workers (unified: humans + AI agents)

  private parseWorker(row: any): Worker {
    return {
      ...row,
      capabilities: row.capabilities ? JSON.parse(row.capabilities) : undefined,
      agent_config: row.agent_config ? JSON.parse(row.agent_config) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  async createWorker(worker: Omit<Worker, 'created_at' | 'updated_at'>): Promise<Worker> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(`
      INSERT INTO workers (
        id, company_id, worker_type, name, email, status, role, department,
        first_name, last_name, phone, salary, currency, start_date, end_date, heysalad_user_id,
        capabilities, model_name, version, cost_per_hour, agent_config,
        created_at, updated_at, last_active_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      worker.id,
      worker.company_id,
      worker.worker_type,
      worker.name,
      worker.email || null,
      worker.status,
      worker.role,
      worker.department || null,
      worker.first_name || null,
      worker.last_name || null,
      worker.phone || null,
      worker.salary || null,
      worker.currency || 'EUR',
      worker.start_date || null,
      worker.end_date || null,
      worker.heysalad_user_id || null,
      worker.capabilities ? JSON.stringify(worker.capabilities) : null,
      worker.model_name || null,
      worker.version || null,
      worker.cost_per_hour || null,
      worker.agent_config ? JSON.stringify(worker.agent_config) : null,
      now,
      now,
      worker.last_active_at || null,
      worker.metadata ? JSON.stringify(worker.metadata) : null,
    ).run();

    return { ...worker, created_at: now, updated_at: now };
  }

  async getWorker(id: string): Promise<Worker | null> {
    const result = await this.db.prepare('SELECT * FROM workers WHERE id = ?').bind(id).first<any>();
    if (!result) return null;
    return this.parseWorker(result);
  }

  async listWorkers(filters?: { company_id?: string; worker_type?: string; status?: string }): Promise<Worker[]> {
    let query = 'SELECT * FROM workers WHERE 1=1';
    const params: any[] = [];

    if (filters?.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }
    if (filters?.worker_type) {
      query += ' AND worker_type = ?';
      params.push(filters.worker_type);
    }
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.prepare(query).bind(...params).all<any>();
    return (result.results || []).map((row: any) => this.parseWorker(row));
  }

  async updateWorker(id: string, updates: Partial<Worker>): Promise<Worker | null> {
    const now = Math.floor(Date.now() / 1000);
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') return;
      if (key === 'capabilities' || key === 'agent_config' || key === 'metadata') {
        fields.push(`${key} = ?`);
        values.push(value ? JSON.stringify(value) : null);
      } else {
        fields.push(`${key} = ?`);
        values.push(value ?? null);
      }
    });

    if (fields.length === 0) return this.getWorker(id);

    fields.push('updated_at = ?');
    values.push(now, id);

    await this.db.prepare(`
      UPDATE workers SET ${fields.join(', ')} WHERE id = ?
    `).bind(...values).run();

    return this.getWorker(id);
  }

  async deactivateWorker(id: string): Promise<Worker | null> {
    return this.updateWorker(id, { status: 'inactive' });
  }

  // Work Sessions

  private parseSession(row: any): WorkSession {
    return {
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  async createSession(session: Omit<WorkSession, 'created_at'>): Promise<WorkSession> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(`
      INSERT INTO work_sessions (
        id, worker_id, worker_type, company_id, start_time, end_time, duration_seconds,
        location, shift_type, task_id, task_description,
        tokens_input, tokens_output, api_calls_count, cost_incurred,
        model_version, error_count, status, notes, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      session.id,
      session.worker_id,
      session.worker_type,
      session.company_id,
      session.start_time,
      session.end_time || null,
      session.duration_seconds || null,
      session.location || null,
      session.shift_type || null,
      session.task_id || null,
      session.task_description || null,
      session.tokens_input || null,
      session.tokens_output || null,
      session.api_calls_count || null,
      session.cost_incurred || null,
      session.model_version || null,
      session.error_count || 0,
      session.status || 'in_progress',
      session.notes || null,
      session.metadata ? JSON.stringify(session.metadata) : null,
      now,
    ).run();

    // Update worker's last_active_at
    await this.db.prepare('UPDATE workers SET last_active_at = ?, status = ? WHERE id = ?')
      .bind(now, 'active', session.worker_id).run();

    return { ...session, created_at: now };
  }

  async getSession(id: string): Promise<WorkSession | null> {
    const result = await this.db.prepare('SELECT * FROM work_sessions WHERE id = ?').bind(id).first<any>();
    if (!result) return null;
    return this.parseSession(result);
  }

  async endSession(id: string, finalMetrics?: RuntimeMetrics & { notes?: string }): Promise<WorkSession | null> {
    const now = Math.floor(Date.now() / 1000);
    const session = await this.getSession(id);
    if (!session) return null;

    const duration = now - session.start_time;
    const tokensIn = (session.tokens_input || 0) + (finalMetrics?.tokens_input || 0);
    const tokensOut = (session.tokens_output || 0) + (finalMetrics?.tokens_output || 0);
    const apiCalls = (session.api_calls_count || 0) + (finalMetrics?.api_calls_count || 0);
    const cost = (session.cost_incurred || 0) + (finalMetrics?.cost_incurred || 0);
    const errors = (session.error_count || 0) + (finalMetrics?.error_count || 0);

    await this.db.prepare(`
      UPDATE work_sessions SET
        end_time = ?, duration_seconds = ?, status = ?,
        tokens_input = ?, tokens_output = ?,
        api_calls_count = ?, cost_incurred = ?, error_count = ?,
        notes = COALESCE(?, notes)
      WHERE id = ?
    `).bind(
      now, duration, errors > 0 ? 'failed' : 'completed',
      tokensIn, tokensOut, apiCalls, cost, errors,
      finalMetrics?.notes || null, id,
    ).run();

    // Update worker status
    await this.db.prepare('UPDATE workers SET last_active_at = ?, status = ? WHERE id = ?')
      .bind(now, 'idle', session.worker_id).run();

    // Upsert daily metrics
    const date = new Date(now * 1000).toISOString().split('T')[0];
    await this.upsertDailyMetrics(session.worker_id, session.worker_type, session.company_id, date, {
      duration_seconds: duration,
      tokens_input: tokensIn,
      tokens_output: tokensOut,
      api_calls: apiCalls,
      cost,
      errors,
      completed: errors === 0 ? 1 : 0,
    });

    return this.getSession(id);
  }

  async updateSessionMetrics(id: string, metrics: RuntimeMetrics): Promise<WorkSession | null> {
    const session = await this.getSession(id);
    if (!session) return null;

    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(`
      UPDATE work_sessions SET
        tokens_input = COALESCE(tokens_input, 0) + ?,
        tokens_output = COALESCE(tokens_output, 0) + ?,
        api_calls_count = COALESCE(api_calls_count, 0) + ?,
        cost_incurred = COALESCE(cost_incurred, 0) + ?,
        error_count = COALESCE(error_count, 0) + ?
      WHERE id = ?
    `).bind(
      metrics.tokens_input || 0,
      metrics.tokens_output || 0,
      metrics.api_calls_count || 0,
      metrics.cost_incurred || 0,
      metrics.error_count || 0,
      id,
    ).run();

    // Heartbeat: update worker last_active_at
    await this.db.prepare('UPDATE workers SET last_active_at = ? WHERE id = ?')
      .bind(now, session.worker_id).run();

    return this.getSession(id);
  }

  async listSessions(filters?: {
    worker_id?: string; company_id?: string; worker_type?: string;
    status?: string; start_date?: string; end_date?: string;
  }): Promise<WorkSession[]> {
    let query = 'SELECT * FROM work_sessions WHERE 1=1';
    const params: any[] = [];

    if (filters?.worker_id) {
      query += ' AND worker_id = ?';
      params.push(filters.worker_id);
    }
    if (filters?.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }
    if (filters?.worker_type) {
      query += ' AND worker_type = ?';
      params.push(filters.worker_type);
    }
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.start_date) {
      const startEpoch = Math.floor(new Date(filters.start_date).getTime() / 1000);
      query += ' AND start_time >= ?';
      params.push(startEpoch);
    }
    if (filters?.end_date) {
      const endEpoch = Math.floor(new Date(filters.end_date).getTime() / 1000);
      query += ' AND start_time <= ?';
      params.push(endEpoch);
    }

    query += ' ORDER BY start_time DESC';
    const result = await this.db.prepare(query).bind(...params).all<any>();
    return (result.results || []).map((row: any) => this.parseSession(row));
  }

  // Worker Metrics

  private async upsertDailyMetrics(
    workerId: string, workerType: string, companyId: string, date: string,
    data: { duration_seconds: number; tokens_input: number; tokens_output: number; api_calls: number; cost: number; errors: number; completed: number }
  ): Promise<void> {
    const existing = await this.db.prepare(
      'SELECT * FROM worker_metrics WHERE worker_id = ? AND date = ?'
    ).bind(workerId, date).first<any>();

    if (existing) {
      await this.db.prepare(`
        UPDATE worker_metrics SET
          total_duration_seconds = total_duration_seconds + ?,
          sessions_count = sessions_count + 1,
          total_tokens_input = total_tokens_input + ?,
          total_tokens_output = total_tokens_output + ?,
          total_api_calls = total_api_calls + ?,
          total_cost = total_cost + ?,
          tasks_completed = tasks_completed + ?,
          error_count = error_count + ?
        WHERE worker_id = ? AND date = ?
      `).bind(
        data.duration_seconds, data.tokens_input, data.tokens_output,
        data.api_calls, data.cost, data.completed, data.errors,
        workerId, date,
      ).run();
    } else {
      const id = crypto.randomUUID();
      await this.db.prepare(`
        INSERT INTO worker_metrics (
          id, worker_id, worker_type, company_id, date,
          total_duration_seconds, sessions_count,
          total_tokens_input, total_tokens_output, total_api_calls,
          total_cost, tasks_completed, error_count
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, workerId, workerType, companyId, date,
        data.duration_seconds, data.tokens_input, data.tokens_output,
        data.api_calls, data.cost, data.completed, data.errors,
      ).run();
    }
  }

  async getWorkerMetrics(workerId: string, startDate?: string, endDate?: string): Promise<WorkerMetrics[]> {
    let query = 'SELECT * FROM worker_metrics WHERE worker_id = ?';
    const params: any[] = [workerId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';
    const result = await this.db.prepare(query).bind(...params).all<WorkerMetrics>();
    return result.results || [];
  }

  // Analytics

  async getWorkforceSummary(companyId: string): Promise<WorkforceSummary> {
    const today = new Date().toISOString().split('T')[0];

    const workers = await this.db.prepare(`
      SELECT
        COUNT(*) as total_workers,
        SUM(CASE WHEN worker_type = 'human' AND status = 'active' THEN 1 ELSE 0 END) as active_humans,
        SUM(CASE WHEN worker_type = 'ai' AND status = 'active' THEN 1 ELSE 0 END) as active_agents,
        SUM(CASE WHEN worker_type = 'ai' AND status = 'idle' THEN 1 ELSE 0 END) as idle_agents
      FROM workers WHERE company_id = ? AND status NOT IN ('inactive', 'terminated')
    `).bind(companyId).first<any>();

    const todayMetrics = await this.db.prepare(`
      SELECT
        COALESCE(SUM(total_cost), 0) as total_cost_today,
        COALESCE(SUM(sessions_count), 0) as total_sessions_today
      FROM worker_metrics WHERE company_id = ? AND date = ?
    `).bind(companyId, today).first<any>();

    return {
      total_workers: workers?.total_workers || 0,
      active_humans: workers?.active_humans || 0,
      active_agents: workers?.active_agents || 0,
      idle_agents: workers?.idle_agents || 0,
      total_cost_today: todayMetrics?.total_cost_today || 0,
      total_sessions_today: todayMetrics?.total_sessions_today || 0,
    };
  }

  async getCostBreakdown(companyId: string, startDate: string, endDate: string): Promise<CostBreakdown[]> {
    const result = await this.db.prepare(`
      SELECT
        date as period,
        SUM(CASE WHEN worker_type = 'human' THEN total_cost ELSE 0 END) as human_costs,
        SUM(CASE WHEN worker_type = 'ai' THEN total_cost ELSE 0 END) as agent_costs,
        SUM(total_cost) as total_cost,
        SUM(CASE WHEN worker_type = 'human' THEN total_duration_seconds ELSE 0 END) / 3600.0 as human_hours,
        SUM(CASE WHEN worker_type = 'ai' THEN total_duration_seconds ELSE 0 END) / 3600.0 as agent_hours
      FROM worker_metrics
      WHERE company_id = ? AND date >= ? AND date <= ?
      GROUP BY date ORDER BY date
    `).bind(companyId, startDate, endDate).all<CostBreakdown>();

    return result.results || [];
  }

  async getRuntimeAnalytics(companyId: string, startDate: string, endDate: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT
        w.id as worker_id, w.name, w.worker_type, w.model_name,
        SUM(m.total_duration_seconds) as total_seconds,
        SUM(m.sessions_count) as total_sessions,
        SUM(m.total_tokens_input) as total_tokens_in,
        SUM(m.total_tokens_output) as total_tokens_out,
        SUM(m.total_cost) as total_cost,
        SUM(m.tasks_completed) as tasks_completed,
        SUM(m.error_count) as total_errors
      FROM worker_metrics m
      JOIN workers w ON w.id = m.worker_id
      WHERE m.company_id = ? AND m.date >= ? AND m.date <= ?
      GROUP BY w.id ORDER BY total_cost DESC
    `).bind(companyId, startDate, endDate).all<any>();

    return result.results || [];
  }
}
