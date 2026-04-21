"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { QUIZ_QUESTIONS, type AnswerKey } from "@/lib/quiz";
import { LoadingAnalysis } from "./LoadingAnalysis";

type Stage = "intro" | "question" | "analyzing" | "error";

export function QuizFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(AnswerKey | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null)
  );
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const total = QUIZ_QUESTIONS.length;
  const current = QUIZ_QUESTIONS[qIndex];

  const completedMicrocopy = useMemo(() => {
    const msgs = [
      "We're decoding your patterns",
      "This one tells us a lot",
      "Your answers are lining up",
      "Patterns starting to show",
      "Almost there — trust the process",
      "One more, then the reveal",
      "Last question. Honestly this one.",
    ];
    return msgs[qIndex] ?? "";
  }, [qIndex]);

  const canProceedIntro = firstName.trim().length >= 1 && /.+@.+\..+/.test(email.trim());

  const pickAnswer = useCallback(
    (key: AnswerKey) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[qIndex] = key;
        return next;
      });
      // Move forward with a tiny delay for feel.
      setTimeout(() => {
        if (qIndex + 1 >= total) {
          void submit([...answers.slice(0, qIndex), key, ...answers.slice(qIndex + 1)]);
        } else {
          setQIndex((i) => i + 1);
        }
      }, 220);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qIndex, total, answers]
  );

  const submit = useCallback(
    async (finalAnswers: (AnswerKey | null)[]) => {
      setStage("analyzing");
      setErrorMsg(null);
      try {
        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            email: email.trim(),
            answers: finalAnswers,
          }),
        });
        const json = (await res.json()) as { ok: boolean; userId?: string; error?: string };
        if (!json.ok || !json.userId) {
          throw new Error(json.error || "Something went sideways on our end.");
        }
        // Short pause so the analysis screen completes its reveal.
        await new Promise((r) => setTimeout(r, 600));
        router.push(`/result/${json.userId}?fresh=1`);
      } catch (err) {
        setErrorMsg((err as Error).message);
        setStage("error");
      }
    },
    [firstName, email, router]
  );

  // ---------- INTRO ----------
  if (stage === "intro") {
    return (
      <main className="flex flex-col min-h-[100dvh] px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-10">
        <header className="mb-10 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            ← Back
          </button>
          <span className="text-sm font-serif italic">
            Attached<span className="text-[var(--brand)]">.</span>
          </span>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col"
        >
          <div className="inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] text-xs text-[var(--fg-muted)] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
            <span>7 questions · 2 minutes</span>
          </div>
          <h1 className="font-serif text-[2.6rem] leading-[1.02] mb-4">
            First, who's
            <br />
            <span className="italic text-[var(--brand)]">decoding</span> themselves?
          </h1>
          <p className="text-[var(--fg-muted)] mb-8 leading-relaxed">
            We save your results so you can come back and see
            them. No password, no social login. Just honesty.
          </p>
          <div className="space-y-4 mb-auto">
            <div>
              <label className="text-xs uppercase tracking-widest text-[var(--fg-muted)] mb-2 block">
                Your first name
              </label>
              <Input
                autoFocus
                placeholder="Taylor"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                inputMode="text"
                maxLength={40}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[var(--fg-muted)] mb-2 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@something.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
              />
              <p className="text-xs text-[var(--fg-muted)] mt-2 leading-relaxed">
                So we can save your result and send you the full report. No spam — pinky.
              </p>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <Button
              disabled={!canProceedIntro}
              onClick={() => setStage("question")}
              size="full"
              className="h-16 text-lg"
            >
              Begin <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ---------- ANALYZING ----------
  if (stage === "analyzing") {
    return <LoadingAnalysis />;
  }

  // ---------- ERROR ----------
  if (stage === "error") {
    return (
      <main className="flex flex-col min-h-[100dvh] px-6 pt-24 pb-10 text-center items-center justify-center">
        <h1 className="font-serif text-3xl mb-3">That didn't land.</h1>
        <p className="text-[var(--fg-muted)] mb-8 leading-relaxed max-w-sm">
          {errorMsg ?? "Something on our end went off-script. Try again."}
        </p>
        <Button
          onClick={() => {
            setStage("question");
            setErrorMsg(null);
          }}
        >
          Try again
        </Button>
      </main>
    );
  }

  // ---------- QUESTION ----------
  const progressValue = ((qIndex + (answers[qIndex] ? 1 : 0)) / total) * 100;

  return (
    <main className="flex flex-col min-h-[100dvh] px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-10">
      <header className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (qIndex === 0) {
                setStage("intro");
              } else {
                setQIndex((i) => Math.max(0, i - 1));
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-xs text-[var(--fg-muted)] tabular-nums">
            Question {qIndex + 1} of {total}
          </span>
        </div>
        <Progress value={progressValue} />
        <p className="text-xs text-[var(--fg-muted)] italic">{completedMicrocopy}</p>
      </header>

      <AnimatePresence mode="wait">
        <motion.section
          key={qIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 flex flex-col"
        >
          <h2 className="font-serif text-[2rem] leading-[1.1] mb-2">{current.prompt}</h2>
          {current.microcopy && (
            <p className="text-sm italic text-[var(--fg-muted)] mb-6">{current.microcopy}</p>
          )}
          <div className="space-y-3 mt-4">
            {current.options.map((opt) => {
              const selected = answers[qIndex] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => pickAnswer(opt.key)}
                  className={
                    "w-full text-left p-5 rounded-2xl border transition-all active:scale-[0.98] " +
                    (selected
                      ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_18%,var(--bg-elev))] shadow-[0_4px_24px_-8px_rgba(91,42,66,0.4)]"
                      : "border-[var(--border)] bg-[var(--bg-elev)] hover:border-[var(--fg-muted)]")
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        "shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 transition-all " +
                        (selected
                          ? "border-[var(--brand)] bg-[var(--brand)]"
                          : "border-[var(--border)]")
                      }
                    />
                    <span className="leading-snug text-[15px]">{opt.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>
      </AnimatePresence>
    </main>
  );
}
