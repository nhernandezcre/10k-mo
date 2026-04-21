import { NextResponse } from "next/server";
import { scoreQuiz, type AnswerKey } from "@/lib/quiz";
import { writeSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { upsertProfile } from "@/lib/supabase/persist";

export const runtime = "nodejs";

type Body = {
  firstName?: string;
  email?: string;
  answers?: (AnswerKey | null)[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = (body.firstName || "").trim().slice(0, 60);
  const email = (body.email || "").trim().toLowerCase();
  const answers = (body.answers || []).filter((a): a is AnswerKey => !!a);

  if (!firstName) {
    return NextResponse.json({ ok: false, error: "First name is required." }, { status: 400 });
  }
  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ ok: false, error: "That email looks off." }, { status: 400 });
  }
  if (answers.length !== 7) {
    return NextResponse.json(
      { ok: false, error: "We need all 7 answers to score this." },
      { status: 400 }
    );
  }

  const { primary } = scoreQuiz(answers);

  // Create or reuse an auth.users row keyed on email. This is the "unconfirmed
  // Supabase user" the product brief describes — the user doesn't need to
  // click a magic link to see their result.
  const admin = createAdminClient();
  let userId: string | null = null;

  // Try to find existing user by email.
  const { data: existingList } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });
  // Search API in supabase-js doesn't filter by email on listUsers → use a
  // direct get. We call listUsers with page 1 just to keep a single-roundtrip;
  // the real existence check is a scan below (Supabase paginates 50/page).
  // For a smoother path, just try to create; if it errors with "already
  // registered", we then look it up.
  const createRes = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { first_name: firstName },
  });

  if (createRes.error && !/already registered|already been registered|duplicate|exists/i.test(createRes.error.message)) {
    return NextResponse.json(
      { ok: false, error: `Auth error: ${createRes.error.message}` },
      { status: 500 }
    );
  }

  if (createRes.data?.user) {
    userId = createRes.data.user.id;
  } else {
    // Fallback: paginate listUsers to find the user by email. Acceptable for
    // tonight's volume; replace with a lookup query later.
    let page = 1;
    while (!userId && page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (error || !data?.users?.length) break;
      const match = data.users.find((u) => (u.email || "").toLowerCase() === email);
      if (match) userId = match.id;
      if (data.users.length < 100) break;
      page += 1;
    }
  }

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Could not create or find your account. Try again?" },
      { status: 500 }
    );
  }

  // Ensure user_metadata captures everything we need even if the trigger hasn't
  // fired on a race.
  void existingList; // silence lint
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      first_name: firstName,
      attachment_style: primary,
      quiz_answers: answers,
    },
  });

  // Mirror to the profiles table (defensive — swallows errors if schema missing).
  await upsertProfile({
    userId,
    firstName,
    email,
    attachmentStyle: primary,
    quizAnswers: answers,
  });

  // Write the session cookie so /result/[id] works instantly, no magic link needed.
  await writeSession({
    userId,
    firstName,
    email,
    attachmentStyle: primary,
    quizAnswers: answers,
  });

  return NextResponse.json({ ok: true, userId, style: primary });
}
