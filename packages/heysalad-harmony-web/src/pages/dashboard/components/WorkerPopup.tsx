/**
 * WorkerPopup Component
 * Shows detailed worker information in a modal overlay
 */

import { motion } from 'framer-motion';
import { X, Clock, Zap, DollarSign, Activity, User, Bot } from 'lucide-react';
import type { Worker } from '../UniverseDashboard';

interface WorkerPopupProps {
  worker: Worker;
  onClose: () => void;
}

const WorkerPopup = ({ worker, onClose }: WorkerPopupProps) => {
  const statusColor = {
    active: 'text-green-400',
    idle: 'text-yellow-400',
    offline: 'text-red-400',
  }[worker.status];

  const statusBg = {
    active: 'bg-green-400/20',
    idle: 'bg-yellow-400/20',
    offline: 'bg-red-400/20',
  }[worker.status];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        onClick={onClose}
      />

      {/* Popup Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1a1a1a] border-2 border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E01D1D] to-[#C01818] p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                {worker.type === 'human' ? '👥' : '🤖'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{worker.name}</h2>
                <p className="text-white/80 text-sm mt-1">{worker.role}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 ${statusBg} rounded-full flex items-center gap-2`}>
                <span className={`w-2 h-2 ${statusColor.replace('text-', 'bg-')} rounded-full`}></span>
                <span className={`text-sm font-semibold ${statusColor} capitalize`}>
                  {worker.status}
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                📍 {worker.location}
              </div>
            </div>

            {/* Stats Grid */}
            {worker.type === 'human' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold">Hours Today</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {worker.hours_today?.toFixed(1) || '0.0'}h
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-semibold">Status</span>
                  </div>
                  <p className={`text-lg font-bold ${statusColor} capitalize`}>
                    {worker.status}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-semibold">Runtime Today</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {worker.runtime_today?.toFixed(1) || '0.0'}h
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-semibold">Cost Today</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    €{worker.cost_today?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-semibold">Tokens Used</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {worker.tokens_used?.toLocaleString() || '0'} tokens
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {worker.tokens_used
                      ? `~${((worker.tokens_used / 1000000)).toFixed(2)}M`
                      : '0M'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button className="flex-1 px-4 py-2.5 bg-[#E01D1D] hover:bg-[#C01818] text-white font-semibold rounded-lg transition-colors">
                View Details
              </button>
              <button className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors">
                {worker.type === 'human' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default WorkerPopup;
