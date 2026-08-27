import { NextResponse } from 'next/server';
import { JD_PARSER_SYSTEM_PROMPT, formatJDParserUserPrompt, JDParserOutput } from '@/lib/prompts/jdParserPrompt';
import { callLLM, cleanAndParseJSON } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jdText = body.jdText || body.jobDescription || body.text;

    if (!jdText || typeof jdText !== 'string' || !jdText.trim()) {
      return NextResponse.json(
        { error: 'Invalid input: "jdText" or "jobDescription" string is required.' },
        { status: 400 }
      );
    }

    const userPrompt = formatJDParserUserPrompt(jdText);
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

    if (hasKey) {
      try {
        console.log('[parse-jd API] Executing live LLM call with system prompt...');
        const rawResponse = await callLLM(JD_PARSER_SYSTEM_PROMPT, userPrompt);
        const parsedResult = cleanAndParseJSON<JDParserOutput>(rawResponse);

        if (parsedResult?.role_title && Array.isArray(parsedResult.learning_roadmap)) {
          return NextResponse.json(parsedResult);
        }
        console.warn('[parse-jd API] Live LLM response structure invalid. Falling back to mock data.');
      } catch (llmError) {
        console.warn('[parse-jd API] Live LLM call failed or key invalid:', llmError);
      }
    } else {
      console.warn('[parse-jd API] GEMINI_API_KEY not detected. Using structured mock fallback.');
    }

    // Curated mock fallback when API key is absent or LLM fails
    const mockParsedResult: JDParserOutput = {
      role_title: 'Senior Full-Stack AI Engineer',
      core_skills: [
        'Full-Stack Web Architecture',
        'LLM Integration & Prompt Architecture',
        'API Design & Microservices',
        'State Management & Performance'
      ],
      tech_stack: [
        'Next.js 15 App Router',
        'TypeScript',
        'React 19',
        'TailwindCSS',
        'Node.js',
        'Vector DB / RAG'
      ],
      seniority_level: 'Senior',
      learning_roadmap: [
        {
          module_name: 'Module 1: Next.js App Router & Server Components',
          description: 'Deep dive into server actions, streaming SSR, and scalable frontend layout patterns.',
          prerequisite_modules: []
        },
        {
          module_name: 'Module 2: AI Infrastructure & LLM Prompt Parsing',
          description: 'Build structured JSON prompt pipelines, set up LLM guardrails, and implement robust error handlers.',
          prerequisite_modules: ['Module 1: Next.js App Router & Server Components']
        },
        {
          module_name: 'Module 3: Vector Embeddings & RAG Integration',
          description: 'Understand vector indexing, semantic similarity search, and hybrid retrieval pipeline design.',
          prerequisite_modules: ['Module 2: AI Infrastructure & LLM Prompt Parsing']
        },
        {
          module_name: 'Module 4: Code Review Gatekeeper & Automated Testing',
          description: 'Implement strict automated AI code review checks and real-time user feedback loops.',
          prerequisite_modules: ['Module 2: AI Infrastructure & LLM Prompt Parsing']
        }
      ]
    };

    return NextResponse.json(mockParsedResult);
  } catch (error) {
    console.error('Error in parse-jd API:', error);
    return NextResponse.json(
      { error: 'Failed to parse Job Description' },
      { status: 500 }
    );
  }
}


