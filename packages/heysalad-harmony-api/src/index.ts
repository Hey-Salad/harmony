import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import { companiesRoutes } from './routes/companies';
import { employeesRoutes } from './routes/employees';
import { documentsRoutes } from './routes/documents';
import { authRoutes } from './routes/auth';
import { workersRoutes } from './routes/workers';
import { sessionsRoutes } from './routes/sessions';
import { analyticsRoutes } from './routes/analytics';

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('/*', cors({
  origin: ['https://harmony.heysalad.app', 'http://localhost:5173'],
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    service: 'heysalad-harmony-api',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/companies', companiesRoutes);
app.route('/api/employees', employeesRoutes);
app.route('/api/documents', documentsRoutes);
app.route('/api/workers', workersRoutes);
app.route('/api/sessions', sessionsRoutes);
app.route('/api/analytics', analyticsRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default app;
