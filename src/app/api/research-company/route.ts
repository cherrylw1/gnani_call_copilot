import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { researchAndSaveCompany } from "@/lib/company-research";
export async function POST(request: Request) { try { const { company_id } = z.object({ company_id: z.string().uuid() }).parse(await request.json()); const admin = createAdminSupabaseClient(); const { data: company, error } = await admin.from("companies").select("id,domain,company_name").eq("id", company_id).single(); if (error) throw new Error(error.message); const research = await researchAndSaveCompany(company); return NextResponse.json({ research }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Research failed." }, { status: 400 }); } }
