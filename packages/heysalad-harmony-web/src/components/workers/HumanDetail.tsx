import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Clock, Calendar, DollarSign, Activity, Play, Square } from 'lucide-react';
import { Worker, WorkerMetrics, WorkSession } from '../../types';
import { workersApi, sessionsApi } from '../../services/harmonyApiService';

const HumanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [metrics, setMetrics] = useState<WorkerMetrics[]>([]);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

        const active = sessionsRes.sessions.find((s) => s.status === 'in_progress');
        if (active) {
          setActiveSession(active);
          setElapsedSeconds(Math.floor(Date.now() / 1000) - active.start_time);
        }
      } catch (err) {
        console.error('Failed to load worker details:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClockIn = async () => {
    if (!worker) return;
    try {
      const res = await sessionsApi.start({ worker_id: worker.id });
      setActiveSession(res.session);
      setElapsedSeconds(0);
    } catch (err) {
      console.error('Clock in failed:', err);
    }
  };

  const handleClockOut = async () => {
    if (!activeSession) return;
    try {
      await sessionsApi.end(activeSession.id);
      setActiveSession(null);
      setElapsedSeconds(0);
      // Refresh sessions
      if (id) {
        const res = await sessionsApi.list({ worker_id: id });
        setSessions(res.sessions);
      }
    } catch (err) {
      console.error('Clock out failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) {
    return <div className="p-6 text-center text-zinc-400">Worker not found.</div>;
  }

  const totalHours = metrics.reduce((sum, m) => sum + m.total_duration_seconds, 0) / 3600;
  const totalSessions = metrics.reduce((sum, m) => sum + m.sessions_count, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/workforce')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{worker.name}</h1>
          <p className="text-zinc-400 text-sm">{worker.role} &middot; {worker.department || 'No department'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${worker.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-zinc-300 capitalize">{worker.status}</span>
        </div>
      </div>

      {/* Clock In/Out */}
      <div className="bg-gradient-to-br from-[#E01D1D] to-[#c41818] rounded-2xl p-8 text-white">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <h2 className="text-4xl font-bold mb-2 font-mono">{formatTime(elapsedSeconds)}</h2>
          <p className="text-lg mb-5 opacity-90">
            {activeSession ? 'Clocked In' : 'Ready to Clock In'}
          </p>
          <button
            onClick={activeSession ? handleClockOut : handleClockIn}
            className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto transition-all shadow-lg ${
              activeSession ? 'bg-red-800 hover:bg-red-900 text-white' : 'bg-white text-[#E01D1D] hover:bg-gray-100'
            }`}
          >
            {activeSession ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {activeSession ? 'Clock Out' : 'Clock In'}
          </button>
          {activeSession && (
            <p className="mt-3 text-sm opacity-75">
              Started at {new Date(activeSession.start_time * 1000).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: 'text-blue-400' },
          { label: 'Sessions', value: totalSessions.toString(), icon: Activity, color: 'text-cyan-400' },
          { label: 'Salary', value: worker.salary ? `${worker.currency || 'EUR'} ${worker.salary.toLocaleString()}` : 'N/A', icon: DollarSign, color: 'text-green-400' },
          { label: 'Start Date', value: worker.start_date || 'N/A', icon: Calendar, color: 'text-orange-400' },
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

      {/* Timesheet / Session History */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Shift History</h3>
        {sessions.length === 0 ? (
          <p className="text-zinc-500 text-sm">No shifts recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 20).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    session.status === 'completed' ? 'bg-green-500' :
                    session.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm text-white">
                      {new Date(session.start_time * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(session.start_time * 1000).toLocaleTimeString()}
                      {session.end_time && ` - ${new Date(session.end_time * 1000).toLocaleTimeString()}`}
                      {session.location && ` · ${session.location}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {session.duration_seconds != null && (
                    <span className="text-zinc-300 font-medium">
                      {Math.floor(session.duration_seconds / 3600)}h {Math.floor((session.duration_seconds % 3600) / 60)}m
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    session.status === 'completed' ? 'bg-green-900/50 text-green-300' :
                    session.status === 'in_progress' ? 'bg-blue-900/50 text-blue-300' : 'bg-zinc-800 text-zinc-400'
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

export default HumanDetail;
