// Probe Supabase to see whether the schema has been applied.
// Run with: node scripts/check-supabase.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

const envPath = path.resolve(".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const tables = ["profiles", "analyses", "daily_insights"];
let ok = true;
for (const t of tables) {
  const { error } = await sb.from(t).select("*").limit(1);
  if (error) {
    console.log(`✗ ${t}: ${error.message}`);
    ok = false;
  } else {
    console.log(`✓ ${t}: reachable`);
  }
}

if (!ok) {
  console.log(
    "\nSchema not applied. Paste supabase/migrations/0001_init.sql into the Supabase SQL Editor."
  );
  process.exit(1);
}
console.log("\nSchema looks good.");
