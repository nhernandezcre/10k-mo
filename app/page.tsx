import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, HeartCrack, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-[100dvh] px-6 pb-10 pt-[calc(env(safe-area-inset-top)+28px)]">
      {/* Brand */}
      <header className="flex items-center justify-between pb-12">
        <span className="text-xl font-serif italic tracking-tight">Attached<span className="text-[var(--brand)]">.</span></span>
        <Link
          href="/login"
          className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center">
        <div className="mb-5 inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] text-xs text-[var(--fg-muted)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
          <span>AI-powered · 2 minute quiz</span>
        </div>

        <h1 className="font-serif text-[3.1rem] leading-[0.98] tracking-tight mb-6">
          Understand why your
          <br />
          <span className="italic text-[var(--brand)]">relationships</span>
          <br />
          keep ending.
        </h1>

        <p className="text-lg text-[var(--fg-muted)] leading-relaxed mb-8 max-w-[28ch]">
          Find your attachment style. Then decode the person
          you're dating. It takes 2 minutes and it will
          explain 10 years.
        </p>

        {/* Social proof placeholder */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex -space-x-2">
            {["#5b2a42", "#9a5779", "#c188a6", "#f0d8e3"].map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[var(--bg)]"
                style={{ background: c }}
              />
            ))}
          </div>
          <p className="text-sm text-[var(--fg-muted)]">
            <span className="text-[var(--fg)] font-medium">12,847</span> people decoded this week
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="space-y-3">
        <Button asChild size="full" className="h-16 text-lg">
          <Link href="/quiz">
            Take the Quiz <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <p className="text-center text-xs text-[var(--fg-muted)]">
          Free · No credit card · Results in 2 minutes
        </p>
      </div>

      {/* What is attachment theory */}
      <section className="mt-16 space-y-5">
        <h2 className="font-serif text-2xl">What even is this?</h2>
        <p className="text-[var(--fg-muted)] leading-relaxed">
          Your nervous system learned a blueprint for love before you could talk.
          That blueprint — your <em>attachment style</em> — decides how safe you feel
          getting close, how you handle conflict, and who you keep picking.
        </p>
        <p className="text-[var(--fg-muted)] leading-relaxed">
          Most people are running the same pattern on repeat and calling it bad luck.
          Attached. uses AI to decode yours, then shows you exactly why you keep choosing
          the people you do.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <FeatureTile
            icon={<Sparkles className="w-5 h-5" />}
            title="Your style"
            copy="7 questions. One honest answer."
          />
          <FeatureTile
            icon={<HeartCrack className="w-5 h-5" />}
            title="Their style"
            copy="Decode the person you're dating."
          />
          <FeatureTile
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Compatibility"
            copy="AI-scored 0-100."
          />
          <FeatureTile
            icon={<ArrowRight className="w-5 h-5" />}
            title="Actionable"
            copy="What to do with it."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-[var(--border)] text-xs text-[var(--fg-muted)] text-center leading-relaxed">
        <p className="font-serif italic text-base text-[var(--fg)] mb-3">
          "You're not broken. You're patterned."
        </p>
        <p>Attached. · Made for anyone who's ever said "it's me, not them."</p>
      </footer>
    </main>
  );
}

function FeatureTile({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]">
      <div className="text-[var(--brand)] mb-2">{icon}</div>
      <p className="font-medium text-sm mb-0.5">{title}</p>
      <p className="text-xs text-[var(--fg-muted)] leading-snug">{copy}</p>
    </div>
  );
}
