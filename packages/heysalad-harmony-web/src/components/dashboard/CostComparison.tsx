import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Bot } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { CostBreakdown } from '../../types';
import { analyticsApi } from '../../services/harmonyApiService';

interface CostComparisonProps {
  companyId: string;
}

const CostComparison = ({ companyId }: CostComparisonProps) => {
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsApi.costs(companyId);
        setBreakdown(res.breakdown);
      } catch (err) {
        console.error('Failed to load cost data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [companyId]);

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totals = breakdown.reduce(
    (acc, b) => ({
      human: acc.human + b.human_costs,
      agent: acc.agent + b.agent_costs,
      total: acc.total + b.total_cost,
      humanHours: acc.humanHours + b.human_hours,
      agentHours: acc.agentHours + b.agent_hours,
    }),
    { human: 0, agent: 0, total: 0, humanHours: 0, agentHours: 0 },
  );

  const chartData = breakdown.map((b) => ({
    date: b.period,
    'Human Costs': +b.human_costs.toFixed(2),
    'Agent Costs': +b.agent_costs.toFixed(2),
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-500 uppercase">Total Cost</span>
          </div>
          <p className="text-xl font-bold text-white">${totals.total.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase">Human Costs</span>
          </div>
          <p className="text-xl font-bold text-white">${totals.human.toFixed(2)}</p>
          <p className="text-xs text-zinc-500 mt-1">{totals.humanHours.toFixed(1)}h worked</p>
        </div>
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-500 uppercase">Agent Costs</span>
          </div>
          <p className="text-xl font-bold text-white">${totals.agent.toFixed(2)}</p>
          <p className="text-xs text-zinc-500 mt-1">{totals.agentHours.toFixed(1)}h runtime</p>
        </div>
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-500 uppercase">Cost Ratio</span>
          </div>
          <p className="text-xl font-bold text-white">
            {totals.total > 0 ? `${((totals.agent / totals.total) * 100).toFixed(0)}%` : '0%'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Agent share of total</p>
        </div>
      </div>

      {/* Cost Comparison Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Daily Cost Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 11 }} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="Human Costs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Agent Costs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CostComparison;
