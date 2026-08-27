import { NextResponse } from 'next/server';
import { LearningRoadmap, LearningModule } from '@/lib/types';
import { ROADMAP_SYSTEM_PROMPT } from '@/lib/prompts/roadmapPrompt';
import { callLLM, cleanAndParseJSON } from '@/lib/llm';

interface GeneratedRoadmapLLMOutput {
  roadmap_title: string;
  target_role: string;
  skills_extracted: string[];
  modules: Array<{
    title: string;
    description: string;
    estimated_minutes: number;
    challenge_instruction: string;
    starter_code: string;
    expected_outcome: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, goalText, jdText, isBurnout } = body;

    const isLinkedinMode = mode === 'linkedin_jd';
    const isMicro = Boolean(isBurnout);
    const userGoal = goalText || jdText || 'Master Full-Stack AI Application Engineering';

    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

    if (hasKey) {
      try {
        console.log('[generate-roadmap API] Calling live LLM to generate custom roadmap...');
        const userPrompt = `
USER GOAL / INPUT:
"${userGoal}"

MODE: ${mode || 'standard'}
FATIGUE / MICRO-TASK MODE ACTIVE: ${isMicro ? 'YES (Generate 10-minute micro-tasks)' : 'NO'}

Generate a strict JSON object matching this schema:
{
  "roadmap_title": "Concise Course Title",
  "target_role": "Target Role Title",
  "skills_extracted": ["Skill1", "Skill2", "Skill3"],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module overview description",
      "estimated_minutes": ${isMicro ? 10 : 45},
      "challenge_instruction": "Code challenge objective",
      "starter_code": "// starter TypeScript code snippet",
      "expected_outcome": "Expected result description"
    }
  ]
}
`.trim();

        const rawLLMText = await callLLM(ROADMAP_SYSTEM_PROMPT, userPrompt);
        const parsedLLMData = cleanAndParseJSON<GeneratedRoadmapLLMOutput>(rawLLMText);

        if (parsedLLMData?.roadmap_title && Array.isArray(parsedLLMData.modules)) {
          const generatedModules: LearningModule[] = parsedLLMData.modules.map((m, idx) => ({
            id: `mod-${idx + 1}`,
            title: m.title,
            description: m.description,
            estimatedMinutes: isMicro ? 10 : (m.estimated_minutes || 45),
            isMicroTask: isMicro,
            status: idx === 0 ? 'unlocked' : 'locked',
            gatekeeperChallenge: {
              instruction: m.challenge_instruction || `Implement logic for ${m.title}`,
              starterCode: m.starter_code || `export function execute() {\n  return true;\n}`,
              expectedOutcome: m.expected_outcome || 'Code passes all evaluation tests.'
            }
          }));

          const liveRoadmap: LearningRoadmap = {
            id: `roadmap-${Date.now()}`,
            title: parsedLLMData.roadmap_title,
            targetRole: parsedLLMData.target_role || 'AI Engineering Specialist',
            inputMode: mode || 'standard',
            skillsExtracted: parsedLLMData.skills_extracted || ['TypeScript', 'AI Engineering'],
            createdAt: new Date().toISOString(),
            modules: generatedModules
          };

          return NextResponse.json({
            success: true,
            roadmap: liveRoadmap
          });
        }
        console.error('❌ [generate-roadmap API Fallback Triggered] Live LLM response structure invalid or missing fields. Falling back to mock roadmap.', { rawLLMText });
      } catch (llmError: any) {
        console.error('❌ [generate-roadmap API Fallback Triggered] Live LLM call failed. Reason:', llmError?.message || llmError);
      }
    } else {
      console.error('❌ [generate-roadmap API Fallback Triggered] GEMINI_API_KEY / OPENAI_API_KEY environment variable is not defined in process.env.');
    }

    // Curated mock fallback when API key is absent or LLM fails
    const dummyRoadmap: LearningRoadmap = {
      id: `roadmap-${Date.now()}`,
      title: isLinkedinMode
        ? 'Reverse-Engineered Senior AI Engineer Path'
        : goalText
        ? `Accelerated Masterclass: ${goalText}`
        : 'Full-Stack AI Software Engineer Path',
      targetRole: isLinkedinMode ? 'Senior AI Engineer' : 'AI Specialist',
      inputMode: mode || 'standard',
      skillsExtracted: isLinkedinMode
        ? ['Next.js 15 App Router', 'LangChain / LlamaIndex', 'Vector Databases (Pinecone)', 'TypeScript', 'PyTorch']
        : ['TypeScript', 'Next.js App Router', 'LLM Prompting', 'System Design'],
      createdAt: new Date().toISOString(),
      modules: [
        {
          id: 'mod-1',
          title: isMicro ? '⚡ 10-Min Micro: Next.js API Routes Quickstart' : 'Module 1: Advanced Next.js App Router & API Architecture',
          description: isMicro
            ? 'Short bite-sized challenge focusing on quick wins without overload.'
            : 'Deep dive into server actions, edge runtime, and async route handlers for high performance AI backend APIs.',
          estimatedMinutes: isMicro ? 10 : 45,
          isMicroTask: isMicro,
          status: 'unlocked',
          gatekeeperChallenge: {
            instruction: 'Implement an async POST route handler in Next.js that validates request JSON and returns a 200 payload.',
            starterCode: `export async function POST(request: Request) {\n  // TODO: Validate request JSON body\n  // TODO: Return 200 response with payload\n  \n  // Replace with your implementation\n}`,
            expectedOutcome: 'Returns valid JSON with status 200.'
          }
        },
        {
          id: 'mod-2',
          title: isMicro ? '⚡ 10-Min Micro: Vector Embeddings 101' : 'Module 2: RAG & Vector Embeddings Integration',
          description: isMicro
            ? '10-minute micro-task on cosine similarity concepts.'
            : 'Architect a retrieval-augmented generation pipeline using OpenAI embeddings and Pinecone vector store.',
          estimatedMinutes: isMicro ? 10 : 60,
          isMicroTask: isMicro,
          status: 'locked',
          gatekeeperChallenge: {
            instruction: 'Write a helper function to calculate cosine similarity between two vector arrays.',
            starterCode: `function cosineSimilarity(vecA: number[], vecB: number[]): number {\n  // TODO: Calculate dot product of vecA and vecB\n  // TODO: Divide by magnitude product ||vecA|| * ||vecB||\n  \n  // Replace with your implementation\n}`,
            expectedOutcome: 'Function returns correct float score between -1 and 1.'
          }
        },
        {
          id: 'mod-3',
          title: isMicro ? '⚡ 10-Min Micro: Safe Prompt Formatting' : 'Module 3: Gatekeeper Guardrails & Code Safety',
          description: isMicro
            ? 'Quick sanity checks for AI prompts.'
            : 'Enforce strict schema validation on LLM JSON outputs and handle edge-case fallbacks gracefully.',
          estimatedMinutes: isMicro ? 10 : 90,
          isMicroTask: isMicro,
          status: 'locked',
          gatekeeperChallenge: {
            instruction: 'Create a JSON parser fallback that strips markdown block code before JSON parsing.',
            starterCode: `function parseCleanJson(rawText: string) {\n  // TODO: Clean triple backtick markdown wrappers\n  // TODO: Parse cleaned string into JSON object\n  \n  // Replace with your implementation\n}`,
            expectedOutcome: 'Correctly parses JSON even with markdown ```json wrappers.'
          }
        }
      ]
    };

    return NextResponse.json({
      success: true,
      roadmap: dummyRoadmap
    });
  } catch (error) {
    console.error('Error in generate-roadmap API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}

