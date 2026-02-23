import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, Zap, DollarSign, Activity, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Worker, WorkerMetrics, WorkSession } from '../../types';
import { workersApi, sessionsApi } from '../../services/harmonyApiService';
import { timeAgo } from './WorkerCard';

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [metrics, setMetrics] = useState<WorkerMetrics[]>([]);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [workerRes, sessionsRes] = await Promise.all([
          workersApi.getMetrics(id),
          sessionsApi.list({ worker_id: id }),
        ]);
        setWorker(workerRes.worker);
        setMetrics(workerRes.metrics);
        setSessions(sessionsRes.sessions);
      } catch (err) {
        console.error('Failed to load agent details:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="p-6 text-center text-zinc-400">
        Agent not found.
      </div>
    );
  }

  const runtimeData = metrics.map((m) => ({
    date: m.date,
    hours: +(m.total_duration_seconds / 3600).toFixed(2),
    cost: +m.total_cost.toFixed(4),
    tokensIn: m.total_tokens_input,
    tokensOut: m.total_tokens_output,
    sessions: m.sessions_count,
    errors: m.error_count,
  })).reverse();

  const totalCost = metrics.reduce((sum, m) => sum + m.total_cost, 0);
  const totalTokensIn = metrics.reduce((sum, m) => sum + m.total_tokens_input, 0);
  const totalTokensOut = metrics.reduce((sum, m) => sum + m.total_tokens_output, 0);
  const totalHours = metrics.reduce((sum, m) => sum + m.total_duration_seconds, 0) / 3600;
  const totalSessions = metrics.reduce((sum, m) => sum + m.sessions_count, 0);
  const totalErrors = metrics.reduce((sum, m) => sum + m.error_count, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/workforce')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{worker.name}</h1>
          <p className="text-zinc-400 text-sm">{worker.role} &middot; {worker.model_name || 'Unknown model'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${worker.status === 'active' ? 'bg-green-500 animate-pulse' : worker.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-zinc-300 capitalize">{worker.status}</span>
          {worker.last_active_at && (
            <span className="text-xs text-zinc-500 ml-2">Last active: {timeAgo(worker.last_active_at)}</span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Cost', value: `$${totalCost.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
          { label: 'Runtime', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: 'text-blue-400' },
          { label: 'Sessions', value: totalSessions.toString(), icon: Activity, color: 'text-cyan-400' },
          { label: 'Tokens In', value: totalTokensIn.toLocaleString(), icon: Zap, color: 'text-yellow-400' },
          { label: 'Tokens Out', value: totalTokensOut.toLocaleString(), icon: Zap, color: 'text-orange-400' },
          { label: 'Errors', value: totalErrors.toString(), icon: AlertTriangle, color: 'text-red-400' },
        ].map((card) => (
          <div key={card.label} className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-zinc-500 uppercase">{card.label}</span>
            </div>
            <p className="text-lg font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Agent Config */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Agent Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-zinc-500">Model:</span> <span className="text-white ml-2">{worker.model_name || 'N/A'}</span></div>
          <div><span className="text-zinc-500">Version:</span> <span className="text-white ml-2">{worker.version || 'N/A'}</span></div>
          <div><span className="text-zinc-500">Cost/hr:</span> <span className="text-white ml-2">{worker.cost_per_hour != null ? `$${worker.cost_per_hour}` : 'N/A'}</span></div>
          <div><span className="text-zinc-500">Department:</span> <span className="text-white ml-2">{worker.department || 'N/A'}</span></div>
        </div>
        {worker.capabilities && worker.capabilities.length > 0 && (
          <div className="mt-3">
            <span className="text-zinc-500 text-sm">Capabilities: </span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {worker.capabilities.map((cap) => (
                <span key={cap} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs rounded-full">{cap}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      {runtimeData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Runtime Chart */}
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Daily Runtime (hours)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={runtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Chart */}
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Daily Cost ($)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={runtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Token Usage Chart */}
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Token Usage</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={runtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="tokensIn" name="Input Tokens" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tokensOut" name="Output Tokens" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Task History */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Session History</h3>
        {sessions.length === 0 ? (
          <p className="text-zinc-500 text-sm">No sessions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 20).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    session.status === 'completed' ? 'bg-green-500' :
                    session.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                    session.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm text-white">{session.task_description || session.task_id || 'Session'}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(session.start_time * 1000).toLocaleString()}
                      {session.duration_seconds && ` · ${Math.round(session.duration_seconds / 60)}m`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  {session.tokens_input != null && <span>{session.tokens_input.toLocaleString()} in</span>}
                  {session.tokens_output != null && <span>{session.tokens_output.toLocaleString()} out</span>}
                  {session.cost_incurred != null && <span className="text-green-400">${session.cost_incurred.toFixed(4)}</span>}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    session.status === 'completed' ? 'bg-green-900/50 text-green-300' :
                    session.status === 'in_progress' ? 'bg-blue-900/50 text-blue-300' :
                    session.status === 'failed' ? 'bg-red-900/50 text-red-300' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetail;
