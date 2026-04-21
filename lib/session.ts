/**
 * Cookie-based session for Attached.
 *
 * We deliberately keep the "source of truth" small — most app state is stored
 * in the signed cookie jar and on the user's auth.users.user_metadata.
 *
 * Why this architecture:
 *   1. Works on day-one with zero SQL setup.
 *   2. Survives page refreshes and tab switches.
 *   3. If/when the attached_* tables exist, we also write there (see
 *      lib/supabase/persist.ts).
 */

import { cookies } from "next/headers";
import type { AnswerKey, AttachmentStyle } from "./quiz";

export const SESSION_COOKIE = "attached_session";

export type SessionState = {
  userId?: string;            // auth.users.id after signUp call
  firstName?: string;
  email?: string;
  attachmentStyle?: AttachmentStyle;
  quizAnswers?: AnswerKey[];
  isPaid?: boolean;
  paymentTier?: "weekly" | "annual" | "lifetime";
  // Recent analyses (cached client-side too, but the latest shows on dashboard)
  lastAnalysisId?: string;
};

export async function readSession(): Promise<SessionState> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return {};
  }
}

export async function writeSession(patch: Partial<SessionState>) {
  const jar = await cookies();
  const current = await readSession();
  const next = { ...current, ...patch };
  jar.set(SESSION_COOKIE, JSON.stringify(next), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
  return next;
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
