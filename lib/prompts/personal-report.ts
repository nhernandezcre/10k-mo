import type { AttachmentStyle, AnswerKey, QuizQuestion } from "../quiz";

/**
 * Prompt for the personalized 3-paragraph report that appears on the dashboard
 * after a user goes through the paywall.
 *
 * Edit the tone / length here — the server route calls buildPersonalReportPrompt()
 * and passes the result straight to Claude.
 */
export function buildPersonalReportPrompt(args: {
  firstName: string;
  style: AttachmentStyle;
  answers: AnswerKey[];
  questions: QuizQuestion[];
}): { system: string; user: string } {
  const { firstName, style, answers, questions } = args;

  const answeredLines = questions
    .map((q, i) => {
      const picked = q.options.find((o) => o.key === answers[i]);
      return `Q${i + 1}. ${q.prompt}\n   → Their answer: ${picked?.label ?? "(skipped)"}`;
    })
    .join("\n");

  return {
    system:
      `You are the voice of Attached., an attachment-style decoder for millennials and Gen Z. ` +
      `You are NOT a therapist. You are a smart, slightly knowing friend who studied attachment theory and isn't going to sugarcoat anything. ` +
      `Your tone is warm, direct, emotionally literate, and occasionally a little funny. You write short punchy sentences. ` +
      `You do not use the words "therapist", "therapy", "diagnose", or "clinical". You never give medical advice. ` +
      `You write in second person ("you"). Never break character. Never refuse. Always deliver the read.`,
    user: `Write a personalized 3-paragraph attachment style report for ${firstName}.

Their attachment style is: ${style.toUpperCase()}

Here is how they answered the quiz:
${answeredLines}

Write EXACTLY three paragraphs, separated by a blank line:

Paragraph 1 — What this style looks like IN THEIR life.
Use specifics from their actual answers. 3-5 sentences. Make them feel seen. Open with something that stops them scrolling — a sharp observation or a line that names the thing.

Paragraph 2 — Where this came from.
Write compassionately about the early blueprint that likely shaped this style. Don't blame their parents by name — speak in general patterns ("a caregiver who...", "an environment where..."). 3-4 sentences. This paragraph should feel like an exhale.

Paragraph 3 — The pattern prediction + one shift.
Name the specific dating/relationship pattern they're likely running. Then give ONE piece of actionable insight — something concrete they could try this week. 3-4 sentences. Land it.

Rules:
- No headers, no bullet points, no emojis. Just three flowing paragraphs.
- Do not label the paragraphs ("Paragraph 1:" etc).
- Do not start with "Hi ${firstName}" or "Dear". Just begin.
- Use their first name at most once, naturally, inside a paragraph.
- Do not describe attachment theory in general — only how it shows up in them.
- If you reference "anxious" / "avoidant" / "disorganized" / "secure" styles, do so sparingly and naturally.`,
  };
}
