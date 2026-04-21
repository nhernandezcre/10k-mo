import type { AttachmentStyle } from "../quiz";

export type AnalyzeObservations = {
  subjectName: string;
  needResponse: string;          // Q1: how they handle it when you express a need or feeling
  closenessResponse: string;     // Q2: when things get emotionally close
  conflictResponse: string;      // Q3: how they respond to conflict
  consistency: string;           // Q4: how consistent is their communication
  safetyScore: number;           // Q5: 1-10 gut-safety slider
};

/**
 * Prompt for the "analyze someone in your life" flow.
 *
 * Returns a structured JSON block that the route then parses and stores.
 */
export function buildAnalyzePersonPrompt(args: {
  userFirstName: string;
  userStyle: AttachmentStyle;
  observations: AnalyzeObservations;
}): { system: string; user: string } {
  const { userFirstName, userStyle, observations } = args;

  return {
    system:
      `You are the voice of Attached., an attachment-style decoder. ` +
      `You are analyzing a person in the user's life based on the user's observations. ` +
      `You speak as a smart, knowing friend — warm, direct, occasionally funny, never clinical. ` +
      `You do not use the words "therapist", "clinical", "diagnose", or "pathology". ` +
      `You write in second person ("you"). You are confident in your read but acknowledge you're working from limited info. ` +
      `You ALWAYS return a valid JSON object matching the schema the user describes — no prose, no markdown fences, no commentary.`,
    user: `The user is ${userFirstName}. Their own attachment style is: ${userStyle.toUpperCase()}.

They are asking you to analyze someone in their life named ${observations.subjectName}. Here is what they told you about this person:

1. When ${userFirstName} expresses a need or feeling, ${observations.subjectName}: "${observations.needResponse}"
2. When things get emotionally close, ${observations.subjectName}: "${observations.closenessResponse}"
3. When there is conflict, ${observations.subjectName}: "${observations.conflictResponse}"
4. Consistency of their communication week to week: "${observations.consistency}"
5. On a 1-10 scale, ${userFirstName} feels emotionally safe with them at: ${observations.safetyScore}/10

Based on this, do the following:

1. Predict ${observations.subjectName}'s most likely attachment style. Choose exactly one of: secure, anxious, avoidant, disorganized.
2. Generate a compatibility score 0-100 for ${userFirstName} (${userStyle}) × ${observations.subjectName} (your prediction). Use this heuristic as a baseline and then adjust ±10 based on the specific observations:
   - secure × anyone → 75-95 (secure base stabilizes everyone)
   - anxious × avoidant → 20-40 (the classic toxic pairing)
   - anxious × anxious → 55-70 but volatile
   - avoidant × avoidant → 40-55, stable but distant
   - disorganized × anything → 25-55, chaotic
3. Write a 2-paragraph analysis of the dynamic (each paragraph 3-4 sentences). First paragraph: what's actually happening between them — be specific, cite the observations. Second paragraph: where this is likely heading if nothing changes.
4. Write exactly ONE piece of honest advice for ${userFirstName}. A single sentence. Direct. No hedging.

Return your response as a single JSON object with this exact shape:

{
  "predictedStyle": "secure" | "anxious" | "avoidant" | "disorganized",
  "compatibilityScore": <integer 0-100>,
  "analysisText": "<paragraph 1>\\n\\n<paragraph 2>",
  "advice": "<one sentence>"
}

Return ONLY the JSON object. No markdown, no backticks, no surrounding prose.`,
  };
}
