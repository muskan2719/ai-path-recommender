import { GoogleGenAI } from '@google/genai';

export async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // 1. Try Official Google Gen AI SDK if GEMINI_API_KEY is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `${systemPrompt}\n\n${userPrompt}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });
      } catch (firstModelError) {
        // Fallback to gemini-3.5-flash if primary model fails
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });
      }

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Google Gen AI SDK returned an empty text response');
      }
      return rawText;
    } catch (sdkError: any) {
      console.warn(`[LLM Helper] Google Gen AI SDK Error:`, sdkError?.message || sdkError);
      throw sdkError;
    }
  }

  // 2. Fallback to OpenAI API if OPENAI_API_KEY is present
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn(`[LLM Helper] OpenAI API returned status ${res.status}: ${errorText}`);
    throw new Error(`OpenAI API HTTP Error ${res.status}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('OpenAI API returned empty response');
  return rawText;
}

export function cleanAndParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as T;
}
