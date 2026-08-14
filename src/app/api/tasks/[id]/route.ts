import { NextResponse } from "next/server";
import { z } from "zod";
import { taskPriorities, taskStatuses } from "@/lib/outreach-tasks";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  title: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  due_at: z.string().datetime().nullable().optional(),
  snoozed_until: z.string().datetime().nullable().optional()
}).refine((value) => Object.keys(value).length > 0, "No task changes supplied.");

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = patchSchema.parse(await request.json());
    const timestamp = new Date().toISOString();
    const update = {
      ...input,
      completed_at: input.status === "done" ? timestamp : input.status ? null : undefined,
      dismissed_at: input.status === "dismissed" ? timestamp : input.status ? null : undefined,
      snoozed_until: input.status && input.status !== "snoozed" ? null : input.snoozed_until
    };
    const { data, error } = await createAdminSupabaseClient().from("outreach_tasks").update(update).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ task: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Task update failed." }, { status: 400 });
  }
}
