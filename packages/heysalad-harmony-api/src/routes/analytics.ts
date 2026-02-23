import { Hono } from 'hono';
import { Env } from '../types';
import { DatabaseService } from '../services/database';

export const analyticsRoutes = new Hono<{ Bindings: Env }>();

// Workforce summary (counts, costs, active status)
analyticsRoutes.get('/workforce', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const company_id = c.req.query('company_id');

  if (!company_id) {
    return c.json({ error: 'company_id query parameter is required' }, 400);
  }

  const summary = await db.getWorkforceSummary(company_id);
  return c.json({ summary });
});

// Cost breakdown (humans vs agents over time)
analyticsRoutes.get('/costs', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const company_id = c.req.query('company_id');
  const start_date = c.req.query('start_date');
  const end_date = c.req.query('end_date');

  if (!company_id) {
    return c.json({ error: 'company_id query parameter is required' }, 400);
  }

  // Default to last 30 days if no dates provided
  const end = end_date || new Date().toISOString().split('T')[0];
  const start = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const breakdown = await db.getCostBreakdown(company_id, start, end);
  return c.json({ breakdown, period: { start, end } });
});

// Runtime analytics per worker
analyticsRoutes.get('/runtime', async (c) => {
  const db = new DatabaseService(c.env.DB);
  const company_id = c.req.query('company_id');
  const start_date = c.req.query('start_date');
  const end_date = c.req.query('end_date');

  if (!company_id) {
    return c.json({ error: 'company_id query parameter is required' }, 400);
  }

  const end = end_date || new Date().toISOString().split('T')[0];
  const start = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const analytics = await db.getRuntimeAnalytics(company_id, start, end);
  return c.json({ analytics, period: { start, end } });
});
