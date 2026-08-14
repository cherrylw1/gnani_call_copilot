import { createClient } from "@supabase/supabase-js";

for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[key]) throw new Error(`Missing ${key}.`);
}

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const { data: inserted, error: backfillError } = await client.rpc("backfill_outreach_tasks");
if (backfillError) throw new Error(backfillError.message);
const { data: tasks, error: taskError } = await client.from("outreach_tasks").select("task_type,status");
if (taskError) throw new Error(taskError.message);
const byType = (tasks ?? []).reduce((out, task) => ({ ...out, [task.task_type]: (out[task.task_type] ?? 0) + 1 }), {});
console.log(JSON.stringify({ inserted: Number(inserted ?? 0), total: tasks?.length ?? 0, byType }, null, 2));
