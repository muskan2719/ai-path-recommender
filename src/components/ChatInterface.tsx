'use client';

import React, { useState } from 'react';
import { Target, Briefcase, Sparkles, Send, AlertCircle, FileSearch, Loader2 } from 'lucide-react';
import { InputMode } from '@/lib/types';
import { JDParserOutput } from '@/lib/prompts/jdParserPrompt';

interface ChatInterfaceProps {
  onGenerateRoadmap: (data: {
    mode: InputMode;
    goalText?: string;
    jdText?: string;
    parsedJd?: JDParserOutput;
    detectedBurnout: boolean;
    burnoutKeyword?: string;
  }) => void;
  isLoading: boolean;
  onFatigueChange?: (isFatigued: boolean, keyword?: string) => void;
}

const FATIGUE_KEYWORDS = [
  'burnt out',
  'exams',
  'overwhelmed',
  'no time',
  'exhausted',
  'tired',
  'too hard',
  'giving up',
  'stress',
  'drained',
  'stuck'
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onGenerateRoadmap,
  isLoading,
  onFatigueChange
}) => {
  const [mode, setMode] = useState<InputMode>('standard');
  const [goalText, setGoalText] = useState('');
  const [jdText, setJdText] = useState('');
  const [isFatigued, setIsFatigued] = useState(false);
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null);
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const checkFatigueKeywords = (text: string) => {
    const lower = text.toLowerCase();
    const found = FATIGUE_KEYWORDS.find((kw) => lower.includes(kw));
    const fatigueDetected = Boolean(found);
    setIsFatigued(fatigueDetected);
    setDetectedKeyword(found || null);
    if (onFatigueChange) {
      onFatigueChange(fatigueDetected, found);
    }
  };

  const handleInputChange = (text: string, currentMode: InputMode) => {
    if (currentMode === 'standard') {
      setGoalText(text);
    } else {
      setJdText(text);
    }
    checkFatigueKeywords(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const currentText = mode === 'standard' ? goalText : jdText;
    const lower = currentText.toLowerCase();
    const found = FATIGUE_KEYWORDS.find((kw) => lower.includes(kw));
    const fatigueFlag = Boolean(found);

    if (mode === 'linkedin_jd') {
      setIsParsingJd(true);
      try {
        const response = await fetch('/api/parse-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jdText })
        });
        const parsedData = await response.json();

        if (!response.ok || parsedData.error) {
          throw new Error(parsedData.error || 'Failed to parse Job Description');
        }

        const parsedJd: JDParserOutput = parsedData.data || parsedData;

        onGenerateRoadmap({
          mode: 'linkedin_jd',
          jdText,
          parsedJd,
          detectedBurnout: fatigueFlag,
          burnoutKeyword: found
        });
      } catch (err: any) {
        console.error('Error parsing JD:', err);
        setApiError(err.message || 'Failed to parse LinkedIn Job Description. Please try again.');
      } finally {
        setIsParsingJd(false);
      }
    } else {
      onGenerateRoadmap({
        mode: 'standard',
        goalText,
        detectedBurnout: fatigueFlag,
        burnoutKeyword: found
      });
    }
  };

  const isCurrentLoading = isLoading || isParsingJd;

  return (
    <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      {/* Mode Selector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" /> Dual-Mode Learning Architect
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select an input method below to generate your custom mastery roadmap.
          </p>
        </div>

        <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('standard');
              checkFatigueKeywords(goalText);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              mode === 'standard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" /> 🎯 Skill-Based Goal
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('linkedin_jd');
              checkFatigueKeywords(jdText);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              mode === 'linkedin_jd'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-400" /> 💼 Career / Job Description
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'standard' ? (
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Natural Language Skill Goal
            </label>
            <textarea
              rows={3}
              value={goalText}
              onChange={(e) => handleInputChange(e.target.value, 'standard')}
              placeholder='e.g. "I want to learn Full-Stack Next.js with Vector Databases, but I am feeling a bit overwhelmed by the state management..."'
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition leading-relaxed"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Paste Raw LinkedIn Job Description</span>
              <span className="text-[10px] text-purple-400 font-mono">LLM JD Parser API</span>
            </label>
            <textarea
              rows={4}
              value={jdText}
              onChange={(e) => handleInputChange(e.target.value, 'linkedin_jd')}
              placeholder="Paste raw LinkedIn job description text here... (e.g. 'We are hiring a Senior Full-Stack AI Engineer with 3+ years experience in Next.js, TypeScript, Vector Search, and RAG architectures...')"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 text-xs font-mono text-purple-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition leading-relaxed"
            />
          </div>
        )}

        {/* Real-time Burnout Detection Alert */}
        {isFatigued && detectedKeyword && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Real-Time Burnout Keyword Detected:</strong> "{detectedKeyword}". Empathy Engine will convert modules to 10-minute micro-tasks!
            </span>
          </div>
        )}

        {apiError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
            {apiError}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isCurrentLoading || (mode === 'standard' ? !goalText.trim() : !jdText.trim())}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'linkedin_jd'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
            }`}
          >
            {isCurrentLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                {isParsingJd ? 'Parsing Job Description via AI...' : 'Synthesizing Roadmap...'}
              </>
            ) : (
              <>
                {mode === 'linkedin_jd' ? <FileSearch className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {mode === 'linkedin_jd' ? 'Parse JD & Generate Path' : 'Generate Learning Path'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

