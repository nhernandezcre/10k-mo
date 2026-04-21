import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 1. Introspect columns via PostgREST's OpenAPI.
const openapi = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
  headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
}).then((r) => r.json());

const tables = Object.keys(openapi.definitions || {});
console.log("Visible tables:", tables);

for (const t of tables) {
  const cols = openapi.definitions[t]?.properties
    ? Object.keys(openapi.definitions[t].properties)
    : [];
  console.log(`  ${t}: [${cols.join(", ")}]`);
}

// 2. Count profiles rows.
const { count, error } = await sb.from("profiles").select("*", { count: "exact", head: true });
if (error) console.log("count error:", error);
else console.log(`profiles row count: ${count}`);
