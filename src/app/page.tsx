'use client';

import React, { useState } from 'react';
import { Cpu } from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { EmpathyBanner } from '@/components/EmpathyBanner';
import { ChatInterface } from '@/components/ChatInterface';
import { RoadmapVisualizer } from '@/components/RoadmapVisualizer';
import { ChallengeModal } from '@/components/ChallengeModal';
import { LearningRoadmap, LearningModule, InputMode } from '@/lib/types';
import { JDParserOutput } from '@/lib/prompts/jdParserPrompt';

export default function Home() {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [activeChallengeModule, setActiveChallengeModule] = useState<LearningModule | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [isBurnoutMode, setIsBurnoutMode] = useState<boolean>(false);
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateRoadmap = async (data: {
    mode: InputMode;
    goalText?: string;
    jdText?: string;
    parsedJd?: JDParserOutput;
    detectedBurnout: boolean;
    burnoutKeyword?: string;
  }) => {
    setIsLoading(true);
    setDetectedKeyword(data.burnoutKeyword || null);
    setIsBurnoutMode(data.detectedBurnout);

    try {
      if (data.mode === 'linkedin_jd' && data.parsedJd) {
        // Construct roadmap directly from parsed LinkedIn Job Description
        const parsed = data.parsedJd;
        const generatedModules: LearningModule[] = parsed.learning_roadmap.map((mod, idx) => ({
          id: `mod-${idx + 1}`,
          title: mod.module_name,
          description: mod.description,
          estimatedMinutes: data.detectedBurnout ? 10 : 45,
          isMicroTask: data.detectedBurnout,
          status: idx === 0 ? 'unlocked' : 'locked',
          gatekeeperChallenge: {
            instruction: `Implement core logic for ${mod.module_name}. ${mod.description}`,
            starterCode: `// Implementation for ${mod.module_name}\nexport function executeTask() {\n  // TODO: Add required logic\n  return {\n    success: true,\n    module: "${mod.module_name}"\n  };\n}`,
            expectedOutcome: `Function returns valid object satisfying ${mod.module_name} requirements.`
          }
        }));

        const newRoadmap: LearningRoadmap = {
          id: `roadmap-jd-${Date.now()}`,
          title: `Reverse-Engineered ${parsed.role_title} Mastery Path`,
          targetRole: `${parsed.role_title} (${parsed.seniority_level})`,
          inputMode: 'linkedin_jd',
          skillsExtracted: [...parsed.core_skills, ...parsed.tech_stack],
          createdAt: new Date().toISOString(),
          modules: generatedModules
        };

        setRoadmap(newRoadmap);
        setSelectedModule(generatedModules[0] || null);
      } else {
        // Fetch generated roadmap for standard goal mode
        const res = await fetch('/api/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: data.mode,
            goalText: data.goalText,
            jdText: data.jdText,
            isBurnout: data.detectedBurnout
          })
        });

        const result = await res.json();
        if (result.success && result.roadmap) {
          setRoadmap(result.roadmap);
          const firstUnlocked = result.roadmap.modules.find((m: LearningModule) => m.status === 'unlocked');
          setSelectedModule(firstUnlocked || result.roadmap.modules[0] || null);
        }
      }
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGatekeeperPassed = (moduleId: string, unlockedNextId?: string) => {
    if (!roadmap) return;

    let targetUnlockId = unlockedNextId;

    // Fallback: unlock next sequential module if unlockedNextId is not specified
    if (!targetUnlockId) {
      const currentIndex = roadmap.modules.findIndex((m) => m.id === moduleId);
      if (currentIndex !== -1 && currentIndex + 1 < roadmap.modules.length) {
        targetUnlockId = roadmap.modules[currentIndex + 1].id;
      }
    }

    const updatedModules = roadmap.modules.map((mod) => {
      if (mod.id === moduleId) {
        return { ...mod, status: 'completed' as const };
      }
      if (mod.id === targetUnlockId && mod.status !== 'completed') {
        return { ...mod, status: 'unlocked' as const };
      }
      return mod;
    });

    const updatedRoadmap: LearningRoadmap = {
      ...roadmap,
      modules: updatedModules
    };

    setRoadmap(updatedRoadmap);

    // Auto-select unlocked next module
    if (targetUnlockId) {
      const nextMod = updatedModules.find((m) => m.id === targetUnlockId);
      if (nextMod) {
        setSelectedModule(nextMod);
      }
    }
  };

  const handleOpenChallenge = (mod: LearningModule) => {
    setActiveChallengeModule(mod);
    setIsChallengeModalOpen(true);
  };

  const handleToggleEmpathy = (enabled: boolean) => {
    setIsBurnoutMode(enabled);
    if (roadmap) {
      const updatedModules = roadmap.modules.map((mod) => ({
        ...mod,
        isMicroTask: enabled,
        estimatedMinutes: enabled ? 10 : 45
      }));
      setRoadmap({
        ...roadmap,
        modules: updatedModules
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 selection:bg-cyan-500/30 font-sans relative overflow-hidden">
      {/* Background Ambient Glow Accents */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-white/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-wide bg-gradient-to-r from-zinc-100 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                  PATHCRAFT <span className="text-cyan-400 font-mono">AI</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono shadow-sm shadow-cyan-500/10">
                  Dual-USP Hackathon Prototype
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Personalized AI Learning Path Recommender</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Focus Challenge Modal Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Clean Full-Width Dashboard */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Dashboard Stat Bar */}
        <Dashboard
          roadmap={roadmap}
          isBurnoutMode={isBurnoutMode}
          activeModuleCount={roadmap?.modules.length || 0}
        />

        {/* Empathy Engine Banner */}
        <EmpathyBanner
          isBurnoutMode={isBurnoutMode}
          onToggleEmpathy={handleToggleEmpathy}
          detectedKeyword={detectedKeyword}
        />

        {/* Dual-Mode Chat Input Interface */}
        <ChatInterface
          onGenerateRoadmap={handleGenerateRoadmap}
          isLoading={isLoading}
          onFatigueChange={(fatigued, keyword) => {
            setIsBurnoutMode(fatigued);
            if (keyword) setDetectedKeyword(keyword);
          }}
        />

        {/* Full-Width Interactive Skill Tree Roadmap */}
        {roadmap && (
          <div className="pt-4">
            <RoadmapVisualizer
              roadmap={roadmap}
              selectedModule={selectedModule}
              onSelectModule={(mod) => setSelectedModule(mod)}
              onOpenChallenge={handleOpenChallenge}
              isBurnoutMode={isBurnoutMode}
            />
          </div>
        )}
      </main>

      {/* Dedicated Gatekeeper Code Reviewer Focus Modal */}
      <ChallengeModal
        module={activeChallengeModule}
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onGatekeeperPassed={handleGatekeeperPassed}
      />
    </div>
  );
}


