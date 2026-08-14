import { NextResponse } from "next/server";
import { z } from "zod";
import { buildTaskDashboard, taskChannels, taskPriorities, taskTypes } from "@/lib/outreach-tasks";
import { loadOutreachTasks } from "@/lib/planning-source";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  task_type: z.enum(taskTypes),
  channel: z.enum(taskChannels),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000).optional().nullable(),
  evidence_text: z.string().trim().max(3000).optional().nullable(),
  prospect_email: z.string().trim().email().optional().nullable().or(z.literal("")),
  prospect_name: z.string().trim().max(180).optional().nullable(),
  account_name: z.string().trim().max(180).optional().nullable(),
  priority: z.enum(taskPriorities).default("medium"),
  due_at: z.string().datetime().optional().nullable()
});

export async function GET() {
  try {
    const tasks = await loadOutreachTasks();
    return NextResponse.json(buildTaskDashboard(tasks), { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Tasks unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = createSchema.parse(await request.json());
    const admin = createAdminSupabaseClient();
    let contact: { id: string; company_id: string | null; full_name: string | null } | null = null;
    if (input.prospect_email) {
      const result = await admin.from("contacts").select("id,company_id,full_name").eq("email", input.prospect_email.toLowerCase()).maybeSingle();
      if (result.error) throw new Error(result.error.message);
      contact = result.data;
    }
    const { data, error } = await admin.from("outreach_tasks").insert({
      ...input,
      prospect_email: input.prospect_email?.toLowerCase() || null,
      prospect_name: input.prospect_name || contact?.full_name || null,
      contact_id: contact?.id ?? null,
      company_id: contact?.company_id ?? null,
      source_kind: "manual",
      status: "open"
    }).select("*").single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Task creation failed." }, { status: 400 });
  }
}
