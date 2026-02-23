import { Bot, User, Clock, Zap, DollarSign, Activity } from 'lucide-react';
import { Worker } from '../../types';

interface WorkerCardProps {
  worker: Worker;
  onClick?: (worker: Worker) => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-500',
  inactive: 'bg-red-500',
  terminated: 'bg-red-800',
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function timeAgo(epoch: number): string {
  const diff = Math.floor(Date.now() / 1000) - epoch;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const WorkerCard = ({ worker, onClick }: WorkerCardProps) => {
  const isAI = worker.worker_type === 'ai';

  return (
    <div
      onClick={() => onClick?.(worker)}
      className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAI ? 'bg-purple-900/50' : 'bg-blue-900/50'}`}>
            {isAI ? <Bot className="w-5 h-5 text-purple-400" /> : <User className="w-5 h-5 text-blue-400" />}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{worker.name}</h3>
            <p className="text-zinc-400 text-xs">{worker.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isAI ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
            {worker.worker_type}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${statusColors[worker.status] || 'bg-gray-500'}`} />
            <span className="text-xs text-zinc-400 capitalize">{worker.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {isAI ? (
          <>
            <div className="bg-zinc-900 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] text-zinc-500 uppercase">Model</span>
              </div>
              <p className="text-xs text-white font-medium truncate">{worker.model_name || 'N/A'}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-zinc-500 uppercase">Cost/hr</span>
              </div>
              <p className="text-xs text-white font-medium">
                {worker.cost_per_hour != null ? `$${worker.cost_per_hour.toFixed(2)}` : 'N/A'}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] text-zinc-500 uppercase">Last Active</span>
              </div>
              <p className="text-xs text-white font-medium">
                {worker.last_active_at ? timeAgo(worker.last_active_at) : 'Never'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-zinc-900 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <User className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-zinc-500 uppercase">Dept</span>
              </div>
              <p className="text-xs text-white font-medium truncate">{worker.department || 'N/A'}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] text-zinc-500 uppercase">Since</span>
              </div>
              <p className="text-xs text-white font-medium">{worker.start_date || 'N/A'}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] text-zinc-500 uppercase">Last Active</span>
              </div>
              <p className="text-xs text-white font-medium">
                {worker.last_active_at ? timeAgo(worker.last_active_at) : 'Never'}
              </p>
            </div>
          </>
        )}
      </div>

      {isAI && worker.capabilities && worker.capabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {worker.capabilities.map((cap) => (
            <span key={cap} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded-full">
              {cap}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerCard;
export { formatDuration, timeAgo };
