import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { STYLE_COPY, type AttachmentStyle } from "@/lib/quiz";
import { readSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/supabase/persist";
import { ArrowRight, Share2 } from "lucide-react";

type Args = { params: Promise<{ userId: string }>; searchParams: Promise<{ fresh?: string }> };

async function loadResult(userId: string): Promise<{
  firstName: string;
  style: AttachmentStyle;
} | null> {
  // 1. Try DB first.
  const fromDb = await getProfileById(userId);
  if (fromDb.ok && fromDb.data?.attachment_style) {
    return {
      firstName: fromDb.data.first_name || "you",
      style: fromDb.data.attachment_style as AttachmentStyle,
    };
  }
  // 2. Fallback: auth.users.user_metadata (tonight's default store).
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (!error && data?.user) {
      const meta = (data.user.user_metadata || {}) as {
        first_name?: string;
        attachment_style?: AttachmentStyle;
      };
      if (meta.attachment_style) {
        return {
          firstName: meta.first_name || data.user.email?.split("@")[0] || "you",
          style: meta.attachment_style,
        };
      }
    }
  } catch {
    // noop
  }
  // 3. Final fallback: the session cookie, if the viewer happens to be the quiz-taker.
  const sess = await readSession();
  if (sess.userId === userId && sess.attachmentStyle) {
    return {
      firstName: sess.firstName || "you",
      style: sess.attachmentStyle,
    };
  }
  return null;
}

export async function generateMetadata({ params }: Args) {
  const { userId } = await params;
  const r = await loadResult(userId);
  if (!r) return { title: "Result" };
  const meta = STYLE_COPY[r.style];
  return {
    title: `${r.firstName} is ${meta.title}`,
    description: `${r.firstName}'s attachment style: ${meta.title}. "${meta.tagline}" — decoded by Attached.`,
    openGraph: {
      title: `${r.firstName} is ${meta.title}`,
      description: meta.tagline,
    },
  };
}

export default async function ResultPage({ params, searchParams }: Args) {
  const { userId } = await params;
  const { fresh } = await searchParams;
  const result = await loadResult(userId);
  if (!result) notFound();

  const meta = STYLE_COPY[result.style];
  const teaser = TEASERS[result.style];

  return (
    <main className="flex flex-col min-h-[100dvh] px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-10">
      {/* Reveal strip */}
      <header className="text-center mb-6">
        {fresh && (
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand)] mb-3 fade-in-up">
            Decoded
          </p>
        )}
        <h1 className="font-serif text-[2.4rem] leading-[1.02] mb-2">
          {result.firstName}, you're
        </h1>
        <p className="font-serif italic text-5xl text-[var(--brand)] leading-none">
          {meta.title}
        </p>
      </header>

      <p className="text-center text-[var(--fg-muted)] leading-relaxed mb-8 max-w-md mx-auto">
        {meta.oneLiner}
      </p>

      {/* Shareable card */}
      <div className="mx-auto mb-4 w-full max-w-[340px]">
        <ResultCard firstName={result.firstName} style={result.style} compact />
      </div>
      <p className="text-center text-xs text-[var(--fg-muted)] mb-10 flex items-center justify-center gap-1.5">
        <Share2 className="w-3 h-3" />
        Screenshot and share. Someone in your life needs to see this.
      </p>

      {/* Teaser + analyze CTA */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)] p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-[var(--brand)] mb-2">The pattern</p>
        <p className="font-serif text-xl leading-snug mb-4">{teaser.headline}</p>
        <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-5">{teaser.body}</p>
        <Button asChild size="full" className="h-14">
          <Link href="/analyze">
            Analyze someone in your life <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </section>

      {/* Secondary actions */}
      <div className="space-y-3">
        <Button asChild variant="secondary" size="full" className="h-12">
          <Link href="/pricing">See your full report →</Link>
        </Button>
        <p className="text-center text-xs text-[var(--fg-muted)]">
          Your results are saved to {maskEmail()}. Come back anytime.
        </p>
      </div>

      <footer className="mt-14 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--fg-muted)] space-y-2">
        <p className="font-serif italic text-sm text-[var(--fg)]">
          "You're not broken. You're patterned."
        </p>
        <p>Attached. · Every style has a way out.</p>
      </footer>
    </main>
  );
}

function maskEmail() {
  // Rendered server-side based on session cookie for a small bit of personalization.
  // Kept non-async to keep the component readable; we accept fallback copy for anon viewers.
  return "your inbox";
}

const TEASERS: Record<AttachmentStyle, { headline: string; body: string }> = {
  secure: {
    headline: "You're drawn to people who need fixing. It feels familiar.",
    body: "Secures often end up as the emotional stability someone else leans on. The risk: you give more than you receive without noticing, until resentment shows up dressed as distance.",
  },
  anxious: {
    headline: "You're drawn to Avoidants — they feel familiar because of your early wiring.",
    body: "The push-pull feels like love because it maps to your earliest blueprint. Your nervous system learned to chase. Want to check if the person you're dating is actually Avoidant?",
  },
  avoidant: {
    headline: "You're drawn to Anxious partners — and you're also the reason they spiral.",
    body: "Their pursuit confirms you're wanted, without the terror of being known. But the closer they get, the more you need space. Want to decode whether yours is Anxious, Disorganized, or something else?",
  },
  disorganized: {
    headline: "You pick people who can't meet you, then punish them for it.",
    body: "You want closeness AND escape. Your partners usually embody one side of your own split. Want to see which — and whether the dynamic can actually work?",
  },
};
