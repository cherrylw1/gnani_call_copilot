import type { CallLogRow } from "@/lib/call-analytics";
import { loadCallReportSource } from "@/lib/call-report-source";
import type { OutreachTask } from "@/lib/outreach-tasks";
import type { PlanningCompany, PlanningContact } from "@/lib/planning-analytics";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function fetchAll<T>(table: string, select: string, orderBy = "created_at") {
  const admin = createAdminSupabaseClient();
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin.from(table).select(select).order(orderBy, { ascending: false }).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) return rows;
  }
}

export async function loadOutreachTasks() {
  return fetchAll<OutreachTask>("outreach_tasks", "*", "created_at");
}

export async function loadPlanningSource() {
  const calls = await loadCallReportSource();
  const [contacts, companies, tasks] = await Promise.all([
    fetchAll<PlanningContact>("contacts", "id,company_id,email,full_name,job_title,persona,city,state,country", "created_at"),
    fetchAll<PlanningCompany>("companies", "id,company_name,industry_auto_classified,fit_score,buyer_partner_competitor_status", "created_at"),
    loadOutreachTasks()
  ]);
  return { calls: calls.rows, contacts, companies, tasks };
}

export function buildAccountMemory(input: { key?: string; companyId?: string; account?: string }, calls: CallLogRow[], contacts: PlanningContact[], companies: PlanningCompany[], tasks: OutreachTask[]) {
  const company = input.companyId ? companies.find((item) => item.id === input.companyId) : companies.find((item) => item.company_name.toLowerCase() === input.account?.toLowerCase());
  const accountName = input.account || company?.company_name || "";
  const accountContacts = contacts.filter((contact) => company ? contact.company_id === company.id : false);
  const emails = new Set(accountContacts.map((contact) => contact.email.toLowerCase()));
  const accountCalls = calls.filter((call) => (company && call.company_id === company.id) || call.account_name.toLowerCase() === accountName.toLowerCase() || emails.has(call.prospect_email.toLowerCase())).sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  for (const call of accountCalls) emails.add(call.prospect_email.toLowerCase());
  const accountTasks = tasks.filter((task) => (company && task.company_id === company.id) || task.account_name?.toLowerCase() === accountName.toLowerCase() || Boolean(task.prospect_email && emails.has(task.prospect_email.toLowerCase()))).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const competitorPattern = /\b(competitor|vendor|solution|internally|in-house|build their own|partnership|nice|genesys|five9|talkdesk|amazon connect|google ccaip|cognigy|polyai)\b/i;
  const competitorNotes = accountCalls.filter((call) => call.call_notes && competitorPattern.test(call.call_notes)).map((call) => ({ id: call.id, note: call.call_notes!, completedAt: call.completed_at, prospect: call.prospect_name }));
  return {
    company: company ?? { id: null, company_name: accountName, industry_auto_classified: accountCalls[0]?.industry ?? null, fit_score: null, buyer_partner_competitor_status: null },
    contacts: accountContacts,
    calls: accountCalls.slice(0, 100),
    tasks: accountTasks,
    competitorNotes,
    summary: {
      contacts: accountContacts.length || emails.size,
      calls: accountCalls.length,
      connectedCalls: accountCalls.filter((call) => call.call_status === "Answered").length,
      openTasks: accountTasks.filter((task) => task.status === "open" || task.status === "snoozed").length,
      lastTouch: accountCalls[0]?.completed_at ?? null
    }
  };
}

export type AccountMemory = ReturnType<typeof buildAccountMemory>;
