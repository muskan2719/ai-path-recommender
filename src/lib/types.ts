export type InputMode = 'standard' | 'linkedin_jd';

export type EmpathyStatus = 'normal' | 'burnout_detected' | 'micro_task_mode';

export interface StudyResource {
  title: string;
  type: 'doc' | 'video' | 'repo' | 'article';
  url: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  isMicroTask: boolean;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  resources?: StudyResource[];
  gatekeeperChallenge?: {
    instruction: string;
    starterCode: string;
    expectedOutcome: string;
  };
}

export interface LearningRoadmap {
  id: string;
  title: string;
  targetRole: string;
  inputMode: InputMode;
  skillsExtracted: string[];
  modules: LearningModule[];
  createdAt: string;
}

export interface CodeReviewRequest {
  moduleId: string;
  codeSnippet: string;
  language: string;
}

export interface CodeReviewResponse {
  passed: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
  unlockedNextModuleId?: string;
}

export interface JDParseResponse {
  jobTitle: string;
  companyName?: string;
  requiredSkills: string[];
  keyResponsibilities: string[];
  suggestedRoadmapTitle: string;
}
