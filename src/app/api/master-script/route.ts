import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const contactColumns = "id,first_name,last_name,full_name,email,job_title,persona,company_id";
const companyColumns = "id,company_name,industry_auto_classified,research_summary";

async function addCompany(contact: Record<string, unknown>) {
  const admin = createAdminSupabaseClient();
  if (!contact.company_id) return { contact, company: null };
  const { data: company, error } = await admin.from("companies").select(companyColumns).eq("id", contact.company_id).maybeSingle();
  if (error) throw new Error(error.message);
  return { contact, company };
}

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim() || "";
    if (query.length < 3) return NextResponse.json({ matches: [] });
    const admin = createAdminSupabaseClient();
    const isEmail = query.includes("@");
    let contactsQuery = admin.from("contacts").select(contactColumns).limit(isEmail ? 1 : 8);
    contactsQuery = isEmail
      ? contactsQuery.eq("email", query.toLowerCase())
      : contactsQuery.ilike("full_name", `%${query}%`);
    const { data: contacts, error } = await contactsQuery;
    if (error) throw new Error(error.message);
    const matches = await Promise.all((contacts || []).map((contact) => addCompany(contact as Record<string, unknown>)));
    return NextResponse.json({ matches }, { headers: { "Cache-Control": "private, max-age=60", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load that contact." }, { status: 400 });
  }
}
