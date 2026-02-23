import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, User, DollarSign, Activity, Plus, Search } from 'lucide-react';
import { Worker, WorkforceSummary } from '../../types';
import { workersApi, analyticsApi } from '../../services/harmonyApiService';
import WorkerCard from '../../components/workers/WorkerCard';
import CostComparison from '../../components/dashboard/CostComparison';

type TabFilter = 'all' | 'human' | 'ai';

const DEMO_COMPANY_ID = 'demo-company';

const Workforce = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [summary, setSummary] = useState<WorkforceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCosts, setShowCosts] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [workersRes, summaryRes] = await Promise.all([
          workersApi.list({ company_id: DEMO_COMPANY_ID }),
          analyticsApi.workforce(DEMO_COMPANY_ID),
        ]);
        setWorkers(workersRes.workers);
        setSummary(summaryRes.summary);
      } catch (err) {
        console.error('Failed to load workforce data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredWorkers = workers
    .filter((w) => activeTab === 'all' || w.worker_type === activeTab)
    .filter((w) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q) || (w.model_name || '').toLowerCase().includes(q);
    });

  const handleWorkerClick = (worker: Worker) => {
    if (worker.worker_type === 'ai') {
      navigate(`/workforce/agent/${worker.id}`);
    } else {
      navigate(`/workforce/human/${worker.id}`);
    }
  };

  const tabs: { key: TabFilter; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: Users },
    { key: 'human', label: 'Humans', icon: User },
    { key: 'ai', label: 'AI Agents', icon: Bot },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workforce</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage humans and AI agents side by side</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCosts(!showCosts)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              showCosts ? 'bg-green-900/30 border-green-700 text-green-300' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <DollarSign className="w-4 h-4 inline-block mr-1" />
            Cost Analytics
          </button>
          <button className="px-4 py-2 bg-[#E01D1D] hover:bg-[#c41818] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Add Worker
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-white" />
              <span className="text-xs text-zinc-500 uppercase">Total Workers</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.total_workers}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-zinc-500 uppercase">Active Humans</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.active_humans}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-zinc-500 uppercase">Active Agents</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.active_agents}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-zinc-500 uppercase">Idle Agents</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.idle_agents}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-zinc-500 uppercase">Cost Today</span>
            </div>
            <p className="text-2xl font-bold text-white">${summary.total_cost_today.toFixed(2)}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-zinc-500 uppercase">Sessions Today</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.total_sessions_today}</p>
          </div>
        </div>
      )}

      {/* Cost Analytics Panel */}
      {showCosts && <CostComparison companyId={DEMO_COMPANY_ID} />}

      {/* Tabs + Search */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.key ? 'bg-[#E01D1D] text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 w-64"
          />
        </div>
      </div>

      {/* Worker Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#E01D1D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No workers found{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} onClick={handleWorkerClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Workforce;
