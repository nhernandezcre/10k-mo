/**
 * Defensive persistence layer.
 *
 * If the Supabase schema is in place, these helpers mirror session state to
 * the database so results survive across devices. If the schema isn't there
 * yet (or any call fails), we swallow the error and rely on the cookie jar
 * as the source of truth. The goal is: the user flow must never break
 * because of a database hiccup.
 */

import type { AnswerKey, AttachmentStyle } from "../quiz";
import { createAdminClient } from "./server";

const TABLE_MISSING_RE = /Could not find the table|does not exist|relation .* does not exist/i;

function isSchemaMissing(err: unknown): boolean {
  const msg = (err as { message?: string })?.message ?? String(err);
  return TABLE_MISSING_RE.test(msg);
}

export type UpsertProfileInput = {
  userId: string;
  firstName?: string;
  email?: string;
  attachmentStyle?: AttachmentStyle;
  quizAnswers?: AnswerKey[];
  isPaid?: boolean;
  paymentTier?: "weekly" | "annual" | "lifetime" | null;
};

export async function upsertProfile(
  input: UpsertProfileInput
): Promise<{ ok: boolean; schemaMissing?: boolean; error?: string }> {
  try {
    const sb = createAdminClient();
    const { error } = await sb.from("profiles").upsert(
      {
        id: input.userId,
        first_name: input.firstName ?? null,
        email: input.email ?? null,
        attachment_style: input.attachmentStyle ?? null,
        quiz_answers: input.quizAnswers ?? null,
        is_paid: input.isPaid ?? false,
        payment_tier: input.paymentTier ?? null,
      },
      { onConflict: "id" }
    );
    if (error) {
      if (isSchemaMissing(error)) return { ok: false, schemaMissing: true };
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    if (isSchemaMissing(err)) return { ok: false, schemaMissing: true };
    return { ok: false, error: (err as Error).message };
  }
}

export async function getProfileById(userId: string) {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      if (isSchemaMissing(error)) return { ok: false as const, schemaMissing: true, data: null };
      return { ok: false as const, error: error.message, data: null };
    }
    return { ok: true as const, data };
  } catch (err) {
    if (isSchemaMissing(err)) return { ok: false as const, schemaMissing: true, data: null };
    return { ok: false as const, error: (err as Error).message, data: null };
  }
}

export type InsertAnalysisInput = {
  userId: string;
  subjectName: string;
  observations: Record<string, unknown>;
  predictedStyle: AttachmentStyle;
  compatibilityScore: number;
  analysisText: string;
  advice: string;
};

export async function insertAnalysis(input: InsertAnalysisInput) {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("analyses")
      .insert({
        user_id: input.userId,
        subject_name: input.subjectName,
        observations: input.observations,
        predicted_style: input.predictedStyle,
        compatibility_score: input.compatibilityScore,
        analysis_text: input.analysisText,
        advice: input.advice,
      })
      .select("id")
      .single();
    if (error) {
      if (isSchemaMissing(error)) return { ok: false as const, schemaMissing: true, id: null };
      return { ok: false as const, error: error.message, id: null };
    }
    return { ok: true as const, id: data.id as string };
  } catch (err) {
    if (isSchemaMissing(err)) return { ok: false as const, schemaMissing: true, id: null };
    return { ok: false as const, error: (err as Error).message, id: null };
  }
}

export async function listAnalyses(userId: string) {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      if (isSchemaMissing(error)) return { ok: false as const, schemaMissing: true, data: [] };
      return { ok: false as const, error: error.message, data: [] };
    }
    return { ok: true as const, data: data ?? [] };
  } catch (err) {
    if (isSchemaMissing(err)) return { ok: false as const, schemaMissing: true, data: [] };
    return { ok: false as const, error: (err as Error).message, data: [] };
  }
}

export async function getAnalysis(analysisId: string, userId: string) {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      if (isSchemaMissing(error)) return { ok: false as const, schemaMissing: true, data: null };
      return { ok: false as const, error: error.message, data: null };
    }
    return { ok: true as const, data };
  } catch (err) {
    if (isSchemaMissing(err)) return { ok: false as const, schemaMissing: true, data: null };
    return { ok: false as const, error: (err as Error).message, data: null };
  }
}
