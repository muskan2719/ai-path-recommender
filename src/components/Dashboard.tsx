'use client';

import React from 'react';
import { Target, ShieldCheck, HeartPulse, Cpu, Layers } from 'lucide-react';
import { LearningRoadmap } from '@/lib/types';

interface DashboardProps {
  roadmap: LearningRoadmap | null;
  isBurnoutMode: boolean;
  activeModuleCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  roadmap,
  isBurnoutMode,
  activeModuleCount
}) => {
  const completedCount = roadmap?.modules.filter((m) => m.status === 'completed').length || 0;
  const totalCount = roadmap?.modules.length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
      {/* Stat 1: Target Path */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between backdrop-blur-md hover:scale-[1.02] hover:border-zinc-700 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 font-mono">Current Path Mode</span>
          <h4 className="text-sm font-semibold text-zinc-100 mt-0.5 capitalize">
            {roadmap?.inputMode === 'linkedin_jd' ? 'LinkedIn Reverse-Engineered' : 'Standard Goal Path'}
          </h4>
        </div>
        <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/10">
          <Target className="w-5 h-5" />
        </div>
      </div>

      {/* Stat 2: Gatekeeper Checkpoints */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between backdrop-blur-md hover:scale-[1.02] hover:border-zinc-700 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 font-mono">Gatekeeper Verification</span>
          <h4 className="text-sm font-semibold text-zinc-100 mt-0.5">
            {completedCount} / {totalCount} Passed
          </h4>
        </div>
        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm shadow-purple-500/10">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Stat 3: Empathy Mode */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between backdrop-blur-md hover:scale-[1.02] hover:border-zinc-700 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 font-mono">Empathy Engine</span>
          <h4 className="text-sm font-semibold text-zinc-100 mt-0.5">
            {isBurnoutMode ? '10-Min Micro Mode' : 'Standard Intensive'}
          </h4>
        </div>
        <div
          className={`p-2.5 rounded-lg border ${
            isBurnoutMode
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/10'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10'
          }`}
        >
          <HeartPulse className="w-5 h-5" />
        </div>
      </div>

      {/* Stat 4: Skills Extracted */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between backdrop-blur-md hover:scale-[1.02] hover:border-zinc-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 font-mono">Target Skills</span>
          <h4 className="text-sm font-semibold text-zinc-100 mt-0.5 truncate max-w-[140px]">
            {roadmap?.skillsExtracted.slice(0, 2).join(', ') || 'AI Architecture'}
          </h4>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm shadow-blue-500/10">
          <Layers className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
