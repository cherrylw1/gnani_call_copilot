import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
const payloadSchema = z.object({ contact_id: z.string().uuid(), company_id: z.string().uuid().nullable().optional(), outcome: z.string().min(1), call_notes: z.string().default(""), objection: z.string().default(""), interest_level: z.string().default(""), next_step: z.string().default(""), follow_up_required: z.boolean().default(false) });
export async function POST(request: Request) { try { const payload = payloadSchema.parse(await request.json()); const { data, error } = await createAdminSupabaseClient().from("call_activities").insert(payload).select().single(); if (error) throw new Error(error.message); return NextResponse.json({ activity: data }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save call activity." }, { status: 400 }); } }
