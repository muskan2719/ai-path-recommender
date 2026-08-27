'use client';

import React from 'react';
import { HeartPulse, Zap, Sparkles } from 'lucide-react';

interface EmpathyBannerProps {
  isBurnoutMode: boolean;
  onToggleEmpathy: (enabled: boolean) => void;
  detectedKeyword?: string | null;
}

export const EmpathyBanner: React.FC<EmpathyBannerProps> = ({
  isBurnoutMode,
  onToggleEmpathy,
  detectedKeyword
}) => {
  return (
    <div
      className={`w-full rounded-xl p-4 transition-all duration-300 border backdrop-blur-md ${
        isBurnoutMode
          ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10 text-amber-200'
          : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 mt-0.5 sm:mt-0 ${
              isBurnoutMode ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isBurnoutMode ? (
              <HeartPulse className="w-5 h-5 animate-pulse text-amber-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs tracking-wider uppercase font-mono">
                {isBurnoutMode ? '🌿 Exam / Fatigue Mode Activated' : '🌿 Empathy Engine Guardrail Active'}
              </span>
              {detectedKeyword && isBurnoutMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  Triggered by "{detectedKeyword}"
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              {isBurnoutMode
                ? '🌿 Exam / Fatigue Mode Activated: Heavy modules paused. Switched to 10-minute micro-tasks to protect your streak.'
                : 'Monitoring goal prompts for cognitive fatigue signals (e.g. "burnt out", "exams", "overwhelmed", "no time").'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleEmpathy(!isBurnoutMode)}
          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 whitespace-nowrap border shrink-0 ${
            isBurnoutMode
              ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-200 shadow-sm'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {isBurnoutMode ? (
            <>
              <Zap className="w-3.5 h-3.5" /> Return to Standard Mode
            </>
          ) : (
            <>
              <HeartPulse className="w-3.5 h-3.5" /> Switch to Micro-Task Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
};

