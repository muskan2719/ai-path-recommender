'use client';

import React from 'react';
import { Lock, Unlock, CheckCircle2, Clock, Zap, Code, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import { LearningModule, LearningRoadmap } from '@/lib/types';

interface RoadmapVisualizerProps {
  roadmap: LearningRoadmap;
  selectedModule: LearningModule | null;
  onSelectModule: (module: LearningModule) => void;
  onOpenChallenge?: (module: LearningModule) => void;
  isBurnoutMode?: boolean;
}

import curatedResources from '@/lib/data/curatedResources.json';

interface ResourceItem {
  title: string;
  icon: string;
  url: string;
}

function getResourcesForModule(mod: LearningModule): ResourceItem[] {
  // If the module has custom valid resources, use them
  if (mod.resources && mod.resources.length > 0) {
    const valid = mod.resources
      .filter((r) => r.url && r.url.trim().length > 0)
      .map((r) => ({
        title: r.title,
        icon: r.type === 'video' ? '▶️' : r.type === 'repo' ? '📝' : '📖',
        url: r.url
      }));
    if (valid.length > 0) return valid;
  }

  const titleLower = `${mod.title} ${mod.description}`.toLowerCase();
  const allRes = curatedResources.learningResources;

  let selectedCategory: Array<{ title: string; type: string; link: string; whyUseful: string }> = [];

  if (titleLower.includes('python') || titleLower.includes('ml') || titleLower.includes('data processing')) {
    selectedCategory = allRes.pythonBasics;
  } else if (titleLower.includes('next') || titleLower.includes('react') || titleLower.includes('frontend') || titleLower.includes('saas') || titleLower.includes('ui')) {
    selectedCategory = allRes.nextjsReact;
  } else if (titleLower.includes('system') || titleLower.includes('design') || titleLower.includes('architecture') || titleLower.includes('distributed')) {
    selectedCategory = allRes.systemDesign;
  } else if (titleLower.includes('api') || titleLower.includes('rest') || titleLower.includes('http') || titleLower.includes('route')) {
    selectedCategory = allRes.restApis;
  } else if (titleLower.includes('ai') || titleLower.includes('llm') || titleLower.includes('rag') || titleLower.includes('vector') || titleLower.includes('embedding')) {
    selectedCategory = allRes.aiLlms;
  } else {
    // Default fallback pick from nextjsReact and restApis
    selectedCategory = [...allRes.nextjsReact.slice(0, 2), ...allRes.restApis.slice(0, 1)];
  }

  return selectedCategory
    .filter((item) => item.link && item.link.trim().length > 0)
    .map((item) => ({
      title: item.title,
      icon: item.type.includes('YouTube') ? '▶️' : item.type.includes('GitHub') ? '📝' : '📖',
      url: item.link
    }));
}


export const RoadmapVisualizer: React.FC<RoadmapVisualizerProps> = ({
  roadmap,
  selectedModule,
  onSelectModule,
  onOpenChallenge,
  isBurnoutMode
}) => {
  const handleModuleClick = (mod: LearningModule) => {
    const isUnlocked = mod.status === 'unlocked' || mod.status === 'completed';
    if (!isUnlocked) return;

    onSelectModule(mod);
    if (onOpenChallenge) {
      onOpenChallenge(mod);
    }
  };

  return (
    <div className="w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Skill Tree Roadmap
            </span>
            {isBurnoutMode && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                🌿 Micro-Task Mode
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-zinc-100 mt-1">{roadmap.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Target Role: <span className="text-zinc-200 font-medium">{roadmap.targetRole}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
          {roadmap.skillsExtracted.map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Vertical Skill Tree List */}
      <div className="space-y-4 relative">
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-zinc-800 -z-10" />

        {roadmap.modules.map((mod, index) => {
          const isSelected = selectedModule?.id === mod.id;
          const isUnlocked = mod.status === 'unlocked' || mod.status === 'completed';
          const showMicroBadge = isBurnoutMode || mod.isMicroTask;
          const resources = getResourcesForModule(mod);

          return (
            <div
              key={mod.id}
              onClick={() => handleModuleClick(mod)}
              className={`p-4 rounded-xl border transition-all duration-200 relative ${
                isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              } ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : mod.status === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-200'
                  : isUnlocked
                  ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 text-zinc-200'
                  : 'bg-zinc-950/30 border-zinc-900 text-zinc-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {/* Status Icon */}
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      mod.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : isUnlocked
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                    }`}
                  >
                    {mod.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isUnlocked ? (
                      <Unlock className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-zinc-400 font-mono">Step {index + 1}</span>
                      <h4 className="text-base font-semibold text-zinc-100">{mod.title}</h4>
                      {showMicroBadge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" /> Micro-Task (10 min)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xl">{mod.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 justify-end font-mono">
                      <Clock className="w-3 h-3" /> {showMicroBadge ? 10 : mod.estimatedMinutes} mins
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 font-mono ${
                        mod.status === 'completed'
                          ? 'text-emerald-400'
                          : isUnlocked
                          ? 'text-cyan-400'
                          : 'text-zinc-600'
                      }`}
                    >
                      {mod.status === 'unlocked' ? 'Current' : mod.status}
                    </span>
                  </div>
                  {isUnlocked && (
                    <ChevronRight
                      className={`w-5 h-5 transition ${isSelected ? 'text-cyan-400 transform translate-x-1' : 'text-zinc-500'}`}
                    />
                  )}
                </div>
              </div>

              {/* RECOMMENDED STUDY MATERIALS SECTION */}
              {isUnlocked && resources.filter((res) => res.url && res.url.trim().length > 0).length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-zinc-800/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recommended Study Materials</span>
                    <span className="text-[10px] text-zinc-500 font-normal font-sans">(Read/Watch before challenge)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {resources
                      .filter((res) => res.url && res.url.trim().length > 0)
                      .map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-950/40 text-zinc-300 hover:text-cyan-300 transition-all group shadow-sm"
                        >
                          <span className="text-xs">{res.icon}</span>
                          <span className="font-medium text-[11px]">{res.title}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                        </a>
                      ))}
                  </div>
                </div>
              )}

              {/* VISUAL DIVIDER & GATEKEEPER CODE CHALLENGE SECTION */}
              {isUnlocked && mod.gatekeeperChallenge && (
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 text-cyan-400/90 font-mono">
                    <Code className="w-3.5 h-3.5 text-cyan-400" /> Gatekeeper Code Challenge Ready
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuleClick(mod);
                    }}
                    className="text-[11px] px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold transition flex items-center gap-1"
                  >
                    Take Challenge &rarr;
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


