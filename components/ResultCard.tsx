"use client";

import { motion } from "framer-motion";
import { STYLE_COPY, type AttachmentStyle } from "@/lib/quiz";

export function ResultCard({
  firstName,
  style,
  compact = false,
}: {
  firstName: string;
  style: AttachmentStyle;
  compact?: boolean;
}) {
  const meta = STYLE_COPY[style];

  return (
    <div
      className={
        compact
          ? "relative w-full aspect-[9/16] max-h-[640px] rounded-3xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.4)]"
          : "relative w-full aspect-[9/16] max-h-[820px] rounded-3xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.45)]"
      }
      style={{
        background: `linear-gradient(160deg, ${meta.color} 0%, #1a0f14 60%, #0a0508 100%)`,
      }}
    >
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #fff 0.5px, transparent 1px), radial-gradient(circle at 70% 60%, #fff 0.5px, transparent 1px)",
          backgroundSize: "3px 3px, 5px 5px",
        }}
      />
      {/* radial blob */}
      <div
        className="absolute -top-40 -right-20 w-[360px] h-[360px] rounded-full blur-3xl opacity-40"
        style={{ background: meta.color }}
      />
      <div
        className="absolute -bottom-20 -left-24 w-[300px] h-[300px] rounded-full blur-3xl opacity-30"
        style={{ background: "#c188a6" }}
      />

      <div className="relative z-10 h-full w-full flex flex-col p-7 text-cream-100">
        <div className="flex items-center justify-between text-cream-100/80 text-xs uppercase tracking-[0.28em]">
          <span className="font-serif italic normal-case tracking-normal text-lg text-cream-100">
            Attached<span className="opacity-70">.</span>
          </span>
          <span>Style Report</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-auto"
        >
          <p className="text-cream-100/70 text-sm mb-3 tracking-wide">
            {firstName || "You"} is
          </p>
          <h2 className="font-serif text-[4.5rem] leading-[0.9] tracking-tight text-cream-100 mb-6">
            <span className="italic">{meta.title}</span>
          </h2>
          <p className="font-serif italic text-xl leading-snug text-cream-100/90 mb-5 max-w-[26ch]">
            "{meta.tagline}"
          </p>
          <p className="text-sm leading-relaxed text-cream-100/80 max-w-[38ch]">
            {meta.oneLiner}
          </p>
        </motion.div>

        <div className="mt-8 pt-5 border-t border-cream-100/15 flex items-center justify-between text-xs text-cream-100/60">
          <span>attachedapp.com</span>
          <span>Decode yours</span>
        </div>
      </div>
    </div>
  );
}
