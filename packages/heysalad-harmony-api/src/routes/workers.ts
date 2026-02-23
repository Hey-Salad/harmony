import { Hono } from 'hono';
import { Env } from '../types';
import { DatabaseService } from '../services/database';

export const workersRoutes = new Hono<{ Bindings: Env }>();

// Create worker (human or AI)
workersRoutes.post('/', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const body = await c.req.json();

  const { company_id, worker_type, name, role } = body;

  if (!company_id || !worker_type || !name || !role) {
    return c.json({ error: 'company_id, worker_type, name, and role are required' }, 400);
  }

  if (!['human', 'ai'].includes(worker_type)) {
    return c.json({ error: 'worker_type must be "human" or "ai"' }, 400);
  }

  const id = crypto.randomUUID();

  const worker = await db.createWorker({
    id,
    company_id,
    worker_type,
    name,
    email: body.email,
    status: body.status || 'active',
    role,
    department: body.department,
    // Human fields
    first_name: body.first_name,
    last_name: body.last_name,
    phone: body.phone,
    salary: body.salary,
    currency: body.currency || 'EUR',
    start_date: body.start_date,
    end_date: body.end_date,
    heysalad_user_id: body.heysalad_user_id,
    // AI agent fields
    capabilities: body.capabilities,
    model_name: body.model_name,
    version: body.version,
    cost_per_hour: body.cost_per_hour,
    agent_config: body.agent_config,
    metadata: body.metadata,
  });

  await db.logAction({
    id: crypto.randomUUID(),
    user_id: body.heysalad_user_id || 'system',
    action: 'create',
    entity_type: 'worker',
    entity_id: id,
  });

  return c.json({ worker }, 201);
});

// Get worker by ID
workersRoutes.get('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param('id');

  const worker = await db.getWorker(id);
  if (!worker) {
    return c.json({ error: 'Worker not found' }, 404);
  }

  return c.json({ worker });
});

// List workers (with filters)
workersRoutes.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const company_id = c.req.query('company_id');
  const worker_type = c.req.query('worker_type');
  const status = c.req.query('status');

  const workers = await db.listWorkers({ company_id, worker_type, status });
  return c.json({ workers });
});

// Update worker
workersRoutes.put('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param('id');
  const updates = await c.req.json();

  const worker = await db.updateWorker(id, updates);
  if (!worker) {
    return c.json({ error: 'Worker not found' }, 404);
  }

  await db.logAction({
    id: crypto.randomUUID(),
    user_id: updates.heysalad_user_id || 'system',
    action: 'update',
    entity_type: 'worker',
    entity_id: id,
    changes: updates,
  });

  return c.json({ worker });
});

// Deactivate worker
workersRoutes.delete('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param('id');

  const worker = await db.deactivateWorker(id);
  if (!worker) {
    return c.json({ error: 'Worker not found' }, 404);
  }

  await db.logAction({
    id: crypto.randomUUID(),
    user_id: 'system',
    action: 'deactivate',
    entity_type: 'worker',
    entity_id: id,
  });

  return c.json({ worker });
});

// Get worker metrics (date range)
workersRoutes.get('/:id/metrics', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param('id');
  const start_date = c.req.query('start_date');
  const end_date = c.req.query('end_date');

  const worker = await db.getWorker(id);
  if (!worker) {
    return c.json({ error: 'Worker not found' }, 404);
  }

  const metrics = await db.getWorkerMetrics(id, start_date, end_date);
  return c.json({ worker, metrics });
});
