export type AttachmentStyle = "secure" | "anxious" | "avoidant" | "disorganized";
export type AnswerKey = "A" | "B" | "C" | "D";

export type QuizQuestion = {
  id: number;
  prompt: string;
  microcopy?: string;
  options: { key: AnswerKey; label: string }[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    prompt: "When someone I'm dating doesn't text back for a few hours, I usually…",
    microcopy: "No wrong answers. Just the honest one.",
    options: [
      { key: "A", label: "Try not to think about it. They'll reply when they reply." },
      { key: "B", label: "Start wondering if I did something wrong." },
      { key: "C", label: "Pull back so I don't seem desperate." },
      { key: "D", label: "Feel a mix — annoyed AND worried, depending on the day." },
    ],
  },
  {
    id: 2,
    prompt: "When things get emotionally serious in a relationship, I tend to…",
    options: [
      { key: "A", label: "Lean in — that's when it gets real." },
      { key: "B", label: "Get anxious but try to seem fine." },
      { key: "C", label: "Find myself needing space." },
      { key: "D", label: "Feel pulled toward them and away at the same time." },
    ],
  },
  {
    id: 3,
    prompt: "My closest people would say I'm…",
    options: [
      { key: "A", label: "Steady. They can count on me." },
      { key: "B", label: "A lot — in a good way, usually." },
      { key: "C", label: "Independent to a fault." },
      { key: "D", label: "Complicated. Worth it, but complicated." },
    ],
  },
  {
    id: 4,
    prompt: "When someone expresses strong feelings for me, my gut reaction is…",
    microcopy: "This is where it gets uncomfortable.",
    options: [
      { key: "A", label: "Return it honestly if I feel it." },
      { key: "B", label: "Relief — I've been waiting to hear it." },
      { key: "C", label: "Suspicion. What do they actually want?" },
      { key: "D", label: "Panic and flattery at the same time." },
    ],
  },
  {
    id: 5,
    prompt: "After a fight with someone I love, I usually…",
    options: [
      { key: "A", label: "Want to talk it through that same day." },
      { key: "B", label: "Obsess until they reassure me." },
      { key: "C", label: "Need days alone before I can re-engage." },
      { key: "D", label: "Swing between wanting closeness and wanting out." },
    ],
  },
  {
    id: 6,
    prompt: "My biggest fear in relationships is…",
    options: [
      { key: "A", label: "Honestly, I don't spend much time fearing the worst." },
      { key: "B", label: "Being abandoned or forgotten." },
      { key: "C", label: "Losing myself or being trapped." },
      { key: "D", label: "Both of the above, on different days." },
    ],
  },
  {
    id: 7,
    prompt: "When I look back at my past relationships, I see a pattern of…",
    microcopy: "Be honest. We already knew.",
    options: [
      { key: "A", label: "Healthy endings, mutual respect, lessons learned." },
      { key: "B", label: "Me caring more than they did." },
      { key: "C", label: "Me pulling away when things got deep." },
      { key: "D", label: "Intense highs and devastating lows." },
    ],
  },
];

const ANSWER_TO_STYLE: Record<AnswerKey, AttachmentStyle> = {
  A: "secure",
  B: "anxious",
  C: "avoidant",
  D: "disorganized",
};

export function scoreQuiz(answers: AnswerKey[]): {
  primary: AttachmentStyle;
  breakdown: Record<AttachmentStyle, number>;
} {
  const breakdown: Record<AttachmentStyle, number> = {
    secure: 0,
    anxious: 0,
    avoidant: 0,
    disorganized: 0,
  };

  for (const a of answers) {
    breakdown[ANSWER_TO_STYLE[a]]++;
  }

  // Tie-breaking priority: anxious > disorganized > avoidant > secure (drives more engagement).
  const priority: AttachmentStyle[] = ["anxious", "disorganized", "avoidant", "secure"];
  let primary: AttachmentStyle = "secure";
  let max = -1;
  for (const style of priority) {
    if (breakdown[style] > max) {
      max = breakdown[style];
      primary = style;
    }
  }

  return { primary, breakdown };
}

export const STYLE_COPY: Record<
  AttachmentStyle,
  { title: string; tagline: string; oneLiner: string; color: string }
> = {
  secure: {
    title: "Secure",
    tagline: "The one everyone wishes they dated.",
    oneLiner:
      "You trust easily, fight fairly, and don't confuse chaos with chemistry. Rare air.",
    color: "#3b6e4e",
  },
  anxious: {
    title: "Anxious",
    tagline: "You love hard. You also spiral hard.",
    oneLiner:
      "You read the texts twice. You feel everything first. The fear of abandonment is older than any of your relationships.",
    color: "#b8572a",
  },
  avoidant: {
    title: "Avoidant",
    tagline: "You keep people at a careful distance — and call it independence.",
    oneLiner:
      "You're fine, everyone's fine, it's fine. Except the part where getting close feels like drowning.",
    color: "#2d4c6b",
  },
  disorganized: {
    title: "Disorganized",
    tagline: "You want them. Then you need them gone. Then you want them back.",
    oneLiner:
      "Intensity is your love language. Whiplash is your pattern. You're not broken — you're patterned.",
    color: "#5b2a42",
  },
};

// For the "analyze someone" compatibility prediction.
export function baseCompatibility(
  user: AttachmentStyle,
  other: AttachmentStyle
): number {
  const s = (a: AttachmentStyle, b: AttachmentStyle) =>
    [a, b].sort().join("-") as
      | "anxious-avoidant"
      | "anxious-disorganized"
      | "anxious-secure"
      | "avoidant-disorganized"
      | "avoidant-secure"
      | "disorganized-secure"
      | "anxious-anxious"
      | "avoidant-avoidant"
      | "disorganized-disorganized"
      | "secure-secure";
  const key = s(user, other);
  const map: Record<string, number> = {
    "secure-secure": 90,
    "anxious-secure": 82,
    "avoidant-secure": 78,
    "disorganized-secure": 72,
    "anxious-anxious": 58,
    "avoidant-avoidant": 45,
    "anxious-avoidant": 28,
    "disorganized-disorganized": 32,
    "anxious-disorganized": 40,
    "avoidant-disorganized": 36,
  };
  return map[key] ?? 50;
}
