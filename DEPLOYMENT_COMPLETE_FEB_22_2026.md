# HeySalad Harmony - Deployment Documentation

**Deployment Date:** February 22, 2026
**Status:** ✅ Production Ready
**Deployed By:** Claude Code

---

## 🌐 Live URLs

### Frontend (Cloudflare Pages)
**URL:** https://8194e734.heysalad-harmony-web.pages.dev

### Backend API (Cloudflare Workers)
**URL:** https://heysalad-harmony-api.heysalad-o.workers.dev
**Version ID:** 67686bcc-e3cd-4750-8ba2-ef9c3dc1a372

---

## 📦 What Was Deployed

### Phase 1: Backend - Unified Worker Database

**New Files:**
- `migrations/002_unified_workers.sql` - D1 migration with workers, work_sessions, and worker_metrics tables with proper indexes and constraints
- `src/routes/workers.ts` - CRUD endpoints for unified workers (GET/POST/PUT/DELETE + metrics)
- `src/routes/sessions.ts` - Session lifecycle (start, end, heartbeat, list)
- `src/routes/analytics.ts` - Workforce summary, cost breakdown, runtime analytics

**Modified Files:**
- `src/types.ts` - Added Worker, WorkSession, WorkerMetrics, RuntimeMetrics, WorkforceSummary, CostBreakdown interfaces
- `src/services/database.ts` - Added ~250 lines of database methods: worker CRUD, session management with automatic metric aggregation, daily metrics upsert, analytics queries with JOINs
- `src/index.ts` - Registered /api/workers, /api/sessions, /api/analytics routes

**Database:**
- D1 Database: `harmony-db` (ID: 443a9bba-1804-4bdd-85e9-0de19b334c6f)
- Migration applied: ✅ 002_unified_workers.sql
- Status: Connected and operational

---

### Phase 2: Agent Runtime SDK

**New Package:** `harmony-agent-sdk/`
- `src/tracker.ts` - HarmonyTracker class with track(), startSession(), reportMetrics(), endSession(), createEventHandler() for ADK events, batched metric flushing with retry
- `src/pricing.ts` - Model pricing table (Gemini, Claude, GPT-4o variants) and calculateCost() function
- `src/types.ts` - TypeScript types for SDK config, metrics, ADK events
- `src/index.ts` - Package exports

**Purpose:** Allow AI agents to automatically track their runtime, costs, and metrics back to the Harmony API.

---

### Phase 3: Frontend - Unified Dashboard

**New Files:**
- `src/pages/hr-manager/Workforce.tsx` - Main dashboard with summary cards, tab filtering (All/Humans/AI), search, cost analytics toggle
- `src/components/workers/WorkerCard.tsx` - Card component showing worker type badge, status indicator, model/cost/department info, capabilities tags
- `src/components/workers/AgentDetail.tsx` - Agent detail page with Recharts (runtime, cost, token usage charts), session history, config display
- `src/components/workers/HumanDetail.tsx` - Human detail with clock in/out functionality via sessions API, shift history
- `src/components/dashboard/CostComparison.tsx` - Side-by-side cost analytics with stacked bar chart (human vs agent costs)
- `src/services/harmonyApiService.ts` - API client for workers, sessions, and analytics endpoints

**Modified Files:**
- `src/types/index.ts` - Added all Worker/Session/Metrics types
- `src/App.tsx` - Added /workforce, /workforce/agent/:id, /workforce/human/:id routes
- `src/components/layout/Layout.tsx` - Added "Workforce" (Bot icon) to HR Manager and Operations Manager sidebar menus

---

### Phase 4: Agent Template

**New Package:** `harmony-agent-template/`
- `agent.py` - ADK LlmAgent definitions with root orchestrator + shopping sub-agent, example tools
- `main.py` - FastAPI server with WebSocket bidi-streaming endpoint + REST endpoint, automatic Harmony tracking in the ADK event loop
- `harmony_tracker.py` - Python SDK mirror with HarmonyTracker class, httpx async client, cost calculation
- `mcp_server/tools.py` - Example MCP tools (order lookup, inventory check, delivery scheduling)

**Purpose:** Template for building AI agents that automatically integrate with the Harmony tracking system.

---

## ✅ Deployment Checklist

- [x] D1 database created and migrated
- [x] API secrets configured in Cloudflare
- [x] Backend API deployed to Cloudflare Workers
- [x] Frontend dependencies installed
- [x] Frontend built for production
- [x] Frontend deployed to Cloudflare Pages
- [x] Environment variables configured
- [x] All API endpoints tested and verified

---

## 🧪 Tested Endpoints

### ✅ Workers API
```bash
# List workers
GET /api/workers?company_id={id}&worker_type={human|ai}&status={active|idle|offline}

# Get worker details
GET /api/workers/{worker_id}

# Create worker
POST /api/workers
{
  "company_id": "string",
  "worker_type": "human|ai",
  "name": "string",
  "role": "string",
  "department": "string",
  ...
}

# Update worker
PUT /api/workers/{worker_id}
{ "status": "active|idle|offline", ... }

# Deactivate worker
DELETE /api/workers/{worker_id}

# Get worker metrics
GET /api/workers/{worker_id}/metrics?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

### ✅ Sessions API
```bash
# Start session
POST /api/sessions/start
{
  "worker_id": "string",
  "task_description": "string",
  "location": "string" (optional),
  "shift_type": "string" (optional)
}

# End session
POST /api/sessions/{session_id}/end
{
  "input_tokens": 5000,
  "output_tokens": 2000,
  "total_cost": 0.45,
  "tasks_completed": 3
}

# Heartbeat (keep session alive + report metrics)
POST /api/sessions/{session_id}/heartbeat
{ "current_task": "string", "metrics": {...} }

# List sessions
GET /api/sessions?worker_id={id}&company_id={id}&status={in_progress|completed|failed}

# Get session details
GET /api/sessions/{session_id}
```

### ✅ Analytics API
```bash
# Workforce summary
GET /api/analytics/workforce?company_id={id}
# Returns: total_workers, active_humans, active_agents, idle_agents, total_cost_today, total_sessions_today

# Cost breakdown
GET /api/analytics/costs?company_id={id}&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
# Returns: daily breakdown with human_costs, agent_costs, human_hours, agent_hours

# Runtime analytics
GET /api/analytics/runtime?company_id={id}&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
# Returns: per-worker runtime stats, token usage, cost trends
```

---

## 🎯 Test Data Created

Successfully created and tested:

**Company:**
- Name: Test Company Inc
- ID: `bb1c4257-79c6-434c-b25a-857b9a17203b`
- Country: US
- Account: test-account-123

**AI Agent:**
- Name: Shopping Agent Alpha
- ID: `6df1ee41-2e6d-4618-a19b-268118b3a9b0`
- Model: claude-opus-4
- Role: Shopping Assistant
- Department: Operations
- Capabilities: shopping, order_processing, customer_support
- Status: idle (after session completion)

**Human Worker:**
- Name: John Doe
- ID: `bf86585a-4deb-4a0d-b790-ee64b328da03`
- Role: Operations Manager
- Department: Operations
- Salary: $75,000 USD
- Start Date: 2026-01-01
- Status: active

**Session:**
- ID: `8c6038b5-481d-427f-8e51-c2c3ded0dc12`
- Worker: Shopping Agent Alpha
- Duration: 6 seconds
- Task: "Processing customer shopping requests"
- Status: completed
- Model: claude-opus-4

---

## 📊 Analytics Verified

**Workforce Summary:**
- Total Workers: 2
- Active Humans: 1
- Active Agents: 0
- Idle Agents: 1
- Total Cost Today: $0.00
- Total Sessions Today: 1

**Cost Breakdown (Feb 22, 2026):**
- Human Costs: $0.00
- Agent Costs: $0.00
- Human Hours: 0
- Agent Hours: 0.0017 hours (6 seconds)

---

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Frontend
VITE_HARMONY_API_URL=https://heysalad-harmony-api.heysalad-o.workers.dev

# Backend (Cloudflare Secrets)
# Set via: wrangler secret put SECRET_NAME
HEYSALAD_OAUTH_CLIENT_ID=<configured>
HEYSALAD_OAUTH_CLIENT_SECRET=<configured>
OPENAI_API_KEY=<configured>
GOOGLE_API_KEY=<configured>
STRIPE_PUBLISHABLE_KEY=<configured>
STRIPE_SECRET_KEY=<configured>
TAVILY_API_KEY=<configured>
BROWSERLESS_API_KEY=<configured>
```

### Wrangler Configuration
```toml
name = "heysalad-harmony-api"
main = "src/index.ts"
compatibility_date = "2024-02-09"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "heysalad-harmony-api"

[[env.production.d1_databases]]
binding = "DB"
database_name = "harmony-db"
database_id = "443a9bba-1804-4bdd-85e9-0de19b334c6f"
```

---

## 🚀 Usage Examples

### Using the Agent SDK (TypeScript)

```typescript
import { HarmonyTracker } from '@heysalad/harmony-agent-sdk';

const tracker = new HarmonyTracker({
  apiUrl: 'https://heysalad-harmony-api.heysalad-o.workers.dev',
  workerId: 'your-worker-id',
  flushInterval: 30000, // 30 seconds
});

// Start a work session
const session = await tracker.startSession({
  taskDescription: 'Processing customer orders',
});

// Track work
await tracker.track({
  inputTokens: 1000,
  outputTokens: 500,
  apiCalls: 1,
});

// Report additional metrics
await tracker.reportMetrics({
  tasksCompleted: 5,
  successRate: 100,
  customMetric: 42,
});

// End session
await tracker.endSession();
```

### Using the Agent SDK (Python)

```python
from harmony_tracker import HarmonyTracker

tracker = HarmonyTracker(
    api_url="https://heysalad-harmony-api.heysalad-o.workers.dev",
    worker_id="your-worker-id",
    flush_interval=30
)

# Start session
session = await tracker.start_session(
    task_description="Processing customer orders"
)

# Track work
await tracker.track(
    input_tokens=1000,
    output_tokens=500,
    api_calls=1
)

# End session
await tracker.end_session()
```

### Direct API Calls

```bash
# Create an AI agent worker
curl -X POST https://heysalad-harmony-api.heysalad-o.workers.dev/api/workers \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "your-company-id",
    "worker_type": "ai",
    "name": "Shopping Agent",
    "role": "Shopping Assistant",
    "model_name": "claude-opus-4",
    "department": "operations",
    "capabilities": ["shopping", "order_processing"]
  }'

# Start a session
curl -X POST https://heysalad-harmony-api.heysalad-o.workers.dev/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "worker-id-here",
    "task_description": "Processing orders"
  }'

# End session with metrics
curl -X POST https://heysalad-harmony-api.heysalad-o.workers.dev/api/sessions/{session_id}/end \
  -H "Content-Type: application/json" \
  -d '{
    "input_tokens": 5000,
    "output_tokens": 2000,
    "total_cost": 0.45,
    "tasks_completed": 10
  }'
```

---

## 📈 Key Features

### Unified Worker Management
- Single API for managing both human employees and AI agents
- Consistent interfaces for tracking work, costs, and performance
- Real-time status tracking (active, idle, offline)

### Session Lifecycle Management
- Start/end sessions for any worker type
- Heartbeat mechanism for long-running agents
- Automatic metric aggregation on session end
- Historical session tracking

### Cost Tracking & Analytics
- Automatic cost calculation for AI agents based on model pricing
- Hourly rate tracking for human workers
- Daily metric aggregation
- Cost comparison between humans and AI agents
- Token usage analytics for AI agents

### Workforce Analytics Dashboard
- Real-time workforce summary
- Filter by worker type (all/humans/AI)
- Search functionality
- Detailed worker profiles with charts
- Cost comparison visualizations

---

## 🔒 Security

- API endpoints ready for OAuth authentication integration
- Environment-based configuration
- Secrets managed via Cloudflare
- CORS enabled for web access

---

## 📝 Database Schema

### workers table
- Unified table for both humans and AI agents
- Worker type differentiation (human|ai)
- Status tracking (active|idle|offline|inactive|terminated)
- Model information for AI agents
- Employment details for humans

### work_sessions table
- Session lifecycle tracking
- Start/end timestamps with duration calculation
- Task descriptions and metadata
- Token usage for AI agents
- Location and shift info for humans

### worker_metrics table
- Daily aggregated metrics per worker
- Total runtime, API calls, token usage
- Cost tracking
- Task completion statistics
- Success rates and error counts

---

## 🎉 Next Steps

1. **Production Usage:**
   - Start creating real workers (humans and AI agents)
   - Integrate the SDK into existing AI agents
   - Monitor workforce analytics in the dashboard

2. **Integration:**
   - Add OAuth authentication for user access
   - Connect to HeySalad account system
   - Integrate with payroll systems for human workers

3. **Enhancements:**
   - Add alerting for high costs or errors
   - Create reporting exports (PDF, CSV)
   - Add budget limits and thresholds
   - Build mobile app for on-the-go management

4. **RAG Integration:**
   - Add this deployment documentation to HeySalad RAG
   - Create API documentation in RAG
   - Add usage examples and tutorials

---

## 🛠️ Maintenance

### Monitoring
- Check Worker logs: `wrangler tail heysalad-harmony-api`
- View metrics in Cloudflare dashboard
- Monitor D1 database size and query performance

### Updates
- Deploy backend: `cd harmony/packages/heysalad-harmony-api && wrangler deploy --env production`
- Deploy frontend: `cd harmony/packages/heysalad-harmony-web && npm run build && wrangler pages deploy dist --project-name=heysalad-harmony-web`

### Database Migrations
```bash
# Create new migration
wrangler d1 migrations create harmony-db <migration_name>

# Apply migration (local)
wrangler d1 migrations apply harmony-db --local

# Apply migration (production)
wrangler d1 migrations apply harmony-db --remote
```

---

## 📞 Support

**Deployed by:** Claude Code
**Platform:** HeySalad OÜ
**Account:** peter@heysalad.io
**Date:** February 22, 2026

For issues or questions, refer to the [HeySalad documentation](https://heysalad-rag.heysalad-o.workers.dev) or contact the platform team.

---

**Status:** ✅ All systems operational and tested
