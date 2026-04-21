"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  "Mapping anxiety responses…",
  "Cross-referencing avoidance patterns…",
  "Calculating secure-base strength…",
  "Decoding conflict style…",
  "Reading between the lines…",
  "Finalizing your attachment signature…",
];

export function LoadingAnalysis() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    let i = 0;
    const tick = () => {
      if (!active) return;
      setStep(i);
      setDone((prev) => (i > 0 ? [...prev, i - 1] : prev));
      i += 1;
      if (i < STEPS.length) {
        setTimeout(tick, 950 + Math.random() * 500);
      } else {
        // mark the last one done too
        setTimeout(() => setDone((p) => [...p, STEPS.length - 1]), 700);
      }
    };
    tick();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex flex-col min-h-[100dvh] px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-10 justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <div className="relative mx-auto w-32 h-32 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--brand)] to-[color-mix(in_srgb,var(--brand)_50%,black)] blur-2xl opacity-60 pulse-glow" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[var(--brand)] to-[#c188a6] opacity-80" />
          <div className="absolute inset-6 rounded-full bg-[var(--bg)] flex items-center justify-center">
            <span className="font-serif italic text-3xl text-[var(--brand)]">A</span>
          </div>
        </div>
        <h1 className="font-serif text-3xl leading-tight mb-2">Reading you in.</h1>
        <p className="text-sm text-[var(--fg-muted)]">This takes a moment. That's on purpose.</p>
      </motion.div>

      <div className="space-y-3 max-w-sm mx-auto w-full">
        <AnimatePresence>
          {STEPS.slice(0, step + 1).map((s, i) => {
            const isDone = done.includes(i);
            const isCurrent = i === step && !isDone;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div
                  className={
                    "shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors " +
                    (isDone
                      ? "bg-[var(--brand)] text-[var(--brand-fg)]"
                      : isCurrent
                        ? "border-2 border-[var(--brand)] pulse-glow"
                        : "border border-[var(--border)]")
                  }
                >
                  {isDone && <Check className="w-3 h-3" />}
                </div>
                <p
                  className={
                    "text-sm transition-colors " +
                    (isDone
                      ? "text-[var(--fg-muted)] line-through decoration-[color-mix(in_srgb,var(--fg-muted)_40%,transparent)]"
                      : isCurrent
                        ? "text-[var(--fg)]"
                        : "text-[var(--fg-muted)]")
                  }
                >
                  {s}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
}
