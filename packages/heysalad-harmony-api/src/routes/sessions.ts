import { Hono } from 'hono';
import { Env } from '../types';
import { DatabaseService } from '../services/database';

export const sessionsRoutes = new Hono<{ Bindings: Env }>();

// Start work session (clock-in or agent run)
sessionsRoutes.post('/start', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const body = await c.req.json();

  const { worker_id } = body;
  if (!worker_id) {
    return c.json({ error: 'worker_id is required' }, 400);
  }

  const worker = await db.getWorker(worker_id);
  if (!worker) {
    return c.json({ error: 'Worker not found' }, 404);
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  const session = await db.createSession({
    id,
    worker_id,
    worker_type: worker.worker_type,
    company_id: worker.company_id,
    start_time: now,
    status: 'in_progress',
    // Human fields
    location: body.location,
    shift_type: body.shift_type,
    // AI agent fields
    task_id: body.task_id,
    task_description: body.task_description,
    model_version: body.model_version || worker.model_name,
    notes: body.notes,
    metadata: body.metadata,
  });

  return c.json({ session }, 201);
});

// End session with final metrics
sessionsRoutes.post('/:id/end', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  const session = await db.endSession(id, body);
  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json({ session });
});

// Agent heartbeat / report metrics mid-session
sessionsRoutes.post('/:id/heartbeat', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param('id');
  const metrics = await c.req.json();

  const session = await db.updateSessionMetrics(id, metrics);
  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json({ session });
});

// List sessions (with filters)
sessionsRoutes.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const filters = {
    worker_id: c.req.query('worker_id'),
    company_id: c.req.query('company_id'),
    worker_type: c.req.query('worker_type'),
    status: c.req.query('status'),
    start_date: c.req.query('start_date'),
    end_date: c.req.query('end_date'),
  };

  const sessions = await db.listSessions(filters);
  return c.json({ sessions });
});

// Get single session
sessionsRoutes.get('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param('id');

  const session = await db.getSession(id);
  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json({ session });
});
