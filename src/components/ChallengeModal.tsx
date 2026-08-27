'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, X, Lightbulb, CheckCircle2, XCircle, RefreshCw, Code2, ArrowRight } from 'lucide-react';
import { LearningModule } from '@/lib/types';
import curatedResources from '@/lib/data/curatedResources.json';

interface ChallengeModalProps {
  module: LearningModule | null;
  isOpen: boolean;
  onClose: () => void;
  onGatekeeperPassed: (moduleId: string, unlockedNextId?: string) => void;
}

interface ReviewResultData {
  status: 'pass' | 'fail';
  passed?: boolean;
  score?: number;
  reasoning: string;
  feedback?: string;
  suggestions?: string[];
  unlockedNextModuleId?: string;
}

interface CuratedChallenge {
  id: string;
  title: string;
  problemStatement: string;
  exampleInput: string;
  validCodeCriteria: string;
  starterCode: string;
}


function getCuratedChallenge(mod: LearningModule): CuratedChallenge {
  const challenges = curatedResources.codingChallenges;
  // Select challenge based on module title / id hash to ensure deterministic variety
  const str = mod.id + mod.title;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % challenges.length;
  return challenges[index];
}

function getHintForModule(mod: LearningModule, challengeObj: CuratedChallenge): string {
  const text = `${mod.title} ${mod.description} ${challengeObj.problemStatement}`.toLowerCase();

  if (text.includes('email') || text.includes('validator')) {
    return '💡 Hint: Use a regex pattern like /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ or check for "@" and "." while rejecting empty/non-string values.';
  }
  if (text.includes('next.js') || text.includes('health') || text.includes('route')) {
    return '💡 Hint: Next.js App Router route handlers export async functions like `export async function GET()`. Use `NextResponse.json({ status: "ok" }, { status: 200 })`.';
  }
  if (text.includes('character') || text.includes('unique') || text.includes('repeating')) {
    return '💡 Hint: Use a frequency map object/dictionary to count occurrences of each character in the string, then iterate through the string again to find the first character with frequency 1.';
  }

  return '💡 Hint: Ensure your code snippet defines a complete function with typed input parameters and an explicit return statement satisfying the target objective.';
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  module,
  isOpen,
  onClose,
  onGatekeeperPassed
}) => {
  if (!isOpen || !module) return null;

  const curated = getCuratedChallenge(module);
  const challenge = module.gatekeeperChallenge;

  const [code, setCode] = useState(() => {
    if (challenge?.starterCode && challenge.starterCode.includes('// TODO')) {
      return challenge.starterCode;
    }
    return curated.starterCode;
  });
  const [showHint, setShowHint] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ReviewResultData | null>(null);

  useEffect(() => {
    if (challenge?.starterCode && challenge.starterCode.includes('// TODO')) {
      setCode(challenge.starterCode);
    } else {
      setCode(curated.starterCode);
    }
    setEvaluation(null);
    setShowHint(false);
  }, [module.id]);



  const handleRunEvaluation = async () => {
    setIsEvaluating(true);

    const targetObjective = challenge?.instruction || `${curated.title}: ${curated.problemStatement} (${curated.validCodeCriteria})`;

    try {
      const res = await fetch('/api/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          codeSnippet: code,
          targetObjective
        })
      });

      const data: ReviewResultData = await res.json();
      setEvaluation(data);

      const isPass = data.status === 'pass' || data.passed === true;
      if (isPass) {
        onGatekeeperPassed(module.id, data.unlockedNextModuleId);
      }
    } catch (err) {
      console.error('Error in code evaluation:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetake = () => {
    setEvaluation(null);
  };

  const isPass = evaluation?.status === 'pass' || evaluation?.passed === true;
  const feedbackText = evaluation?.reasoning || evaluation?.feedback || '';
  const hintText = getHintForModule(module, curated);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                  Gatekeeper Code Challenge Focus Mode
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Senior AI LLM
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Module: <span className="text-zinc-200 font-semibold">{module.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Target Objective Box */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                🎯 Target Objective: <span className="text-zinc-200">{curated.title}</span>
              </span>

              {/* Hint Toggle Button */}
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                {showHint ? 'Hide Hint' : '💡 Get a Hint'}
              </button>
            </div>

            <p className="text-zinc-200 text-xs leading-relaxed">
              {challenge?.instruction || curated.problemStatement}
            </p>

            <div className="space-y-1 pt-2 border-t border-zinc-800/80 text-[11px]">
              <div className="flex items-start gap-2 text-zinc-400">
                <span className="font-mono text-zinc-500 shrink-0">Example/Input:</span>
                <span className="text-zinc-300 font-mono">{curated.exampleInput}</span>
              </div>
              <div className="flex items-start gap-2 text-zinc-400">
                <span className="font-mono text-zinc-500 shrink-0">Criteria:</span>
                <span className="text-zinc-300 font-sans">{curated.validCodeCriteria}</span>
              </div>
            </div>

            {/* Revealed Hint Box */}
            {showHint && (
              <div className="mt-3 p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs animate-in slide-in-from-top-1 duration-200">
                {hintText}
              </div>
            )}
          </div>

          {/* MAIN CONTENT AREA: Show Code Editor if not evaluated, or Show Detailed Results Screen if evaluated */}
          {!evaluation ? (
            <div className="space-y-4">
              {/* Code Editor */}
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border border-b-0 border-zinc-800 rounded-t-xl text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Code2 className="w-4 h-4" /> solution.ts
                  </span>
                  <span className="text-[10px] text-zinc-500">TypeScript Code Submitter</span>
                </div>
                <textarea
                  rows={10}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste or write your implementation code snippet here..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-b-xl p-4 font-mono text-xs text-emerald-400 placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition leading-relaxed resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating || !code.trim()}
                  className="px-6 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Evaluating with Senior AI Gatekeeper...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-white" /> Submit to AI Senior Reviewer
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* DETAILED RESULTS SCREEN */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div
                className={`p-6 rounded-xl border backdrop-blur-md ${
                  isPass
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                }`}
              >
                {/* Result Header & Score */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-3">
                    {isPass ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 🟢 PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm">
                        <XCircle className="w-5 h-5 text-rose-400" /> 🔴 FAIL
                      </span>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-zinc-100">
                        {isPass ? 'Gatekeeper Checkpoint Approved!' : 'Verification Failed'}
                      </h4>
                      <p className="text-xs text-zinc-400">Senior AI Code Review Evaluation</p>
                    </div>
                  </div>

                  {evaluation.score !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono block">Final Score</span>
                      <span
                        className={`text-xl font-bold font-mono ${
                          isPass ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {evaluation.score}/100
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Reasoning & Mistakes */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                      AI Reasoning & Evaluation:
                    </span>
                    <p className="text-xs text-zinc-200 mt-1 leading-relaxed font-sans">{feedbackText}</p>
                  </div>

                  {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1 mb-1 font-mono">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Actionable Critique / Suggestions:
                      </span>
                      <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1 pl-1">
                        {evaluation.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Result Action Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition flex items-center gap-2 border border-zinc-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 🔄 Retake Challenge
                </button>

                {isPass ? (
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    Close & Continue &rarr;
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 transition"
                  >
                    Close Modal
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
