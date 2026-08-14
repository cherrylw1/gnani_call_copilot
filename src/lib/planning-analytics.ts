import { classifyConversation } from "@/lib/conversation-analytics";
import type { CallLogRow } from "@/lib/call-analytics";
import { buildTaskDashboard, type OutreachTask } from "@/lib/outreach-tasks";

export type PlanningContact = {
  id: string;
  company_id: string | null;
  email: string;
  full_name: string | null;
  job_title: string | null;
  persona: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

export type PlanningCompany = {
  id: string;
  company_name: string;
  industry_auto_classified: string | null;
  fit_score: number | null;
  buyer_partner_competitor_status: string | null;
};

const normalize = (value: string | null | undefined) => String(value ?? "").trim();
const lower = (value: string | null | undefined) => normalize(value).toLowerCase();
const percentage = (part: number, whole: number) => whole ? part / whole : 0;
const activeTask = (task: OutreachTask) => task.status === "open" || task.status === "snoozed";
const dayDiff = (iso: string | null) => iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)) : null;

function accountCategory(calls: CallLogRow[], tasks: OutreachTask[], contacts: PlanningContact[]) {
  const open = tasks.filter(activeTask);
  const types = new Set(open.map((task) => task.task_type));
  const answered = calls.filter((call) => call.call_status === "Answered");
  const analyses = answered.map(classifyConversation);
  const allSuppressed = contacts.length > 0 && contacts.every((contact) => tasks.some((task) => task.prospect_email === contact.email && task.task_type === "cleanup" && /remove/i.test(task.title)));
  if (allSuppressed) return { category: "Do not contact", reason: "All known contacts have suppression evidence.", nextAction: "Keep the account out of active outreach." };
  if (types.has("meeting") || types.has("email") || types.has("referral")) return { category: "Work now", reason: "An open follow-up, meeting, or referral action exists.", nextAction: "Complete the highest-priority open task." };
  if (types.has("research")) return { category: "Find stakeholder", reason: "The current contact is not the correct owner.", nextAction: "Identify another relevant contact before dialing again." };
  if (types.has("nurture")) return { category: "Nurture", reason: "A future timing signal was recorded.", nextAction: "Wait for the recorded timing window." };
  if (types.has("cleanup")) return { category: "Data cleanup", reason: "The account has an unresolved contact or activity issue.", nextAction: "Resolve the cleanup task before more outreach." };
  const hasNegative = analyses.some((item) => item.flags.noInterest || item.flags.suppress);
  const uniqueContacts = new Set(calls.map((call) => call.prospect_email)).size;
  const averageTouches = calls.length / Math.max(uniqueContacts, 1);
  if (!answered.length && averageTouches >= 7) return { category: "Pause", reason: "Repeated attempts have not produced a connected call.", nextAction: "Pause this contact set or add a new stakeholder." };
  if (hasNegative && answered.length) return { category: "Pause", reason: "The latest connected evidence is negative without an open next step.", nextAction: "Do not prioritize until a new signal appears." };
  return { category: "Continue outreach", reason: answered.length ? "The account connected but has no open next action." : "The account remains eligible and has limited outreach coverage.", nextAction: answered.length ? "Review the latest note before another touch." : "Continue with an eligible contact." };
}

export function buildPlanningCenter(calls: CallLogRow[], contacts: PlanningContact[], companies: PlanningCompany[], tasks: OutreachTask[]) {
  const callsByCompany = new Map<string, CallLogRow[]>();
  const contactsByCompany = new Map<string, PlanningContact[]>();
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const companyIdByName = new Map(companies.map((company) => [lower(company.company_name), company.id]));
  const contactByEmail = new Map(contacts.map((contact) => [lower(contact.email), contact]));
  const fallbackCompanyKeys = new Map<string, string>();

  for (const contact of contacts) {
    const key = contact.company_id ?? `unlinked:${lower(contact.email)}`;
    contactsByCompany.set(key, [...(contactsByCompany.get(key) ?? []), contact]);
  }
  for (const call of calls) {
    const matchedContact = contactByEmail.get(lower(call.prospect_email));
    const knownId = call.company_id ?? matchedContact?.company_id ?? companyIdByName.get(lower(call.account_name));
    const key = knownId ?? fallbackCompanyKeys.get(lower(call.account_name)) ?? `account:${lower(call.account_name)}`;
    fallbackCompanyKeys.set(lower(call.account_name), key);
    callsByCompany.set(key, [...(callsByCompany.get(key) ?? []), call]);
  }

  const keys = new Set([...contactsByCompany.keys(), ...callsByCompany.keys()]);
  const accounts = [...keys].map((key) => {
    const accountCalls = callsByCompany.get(key) ?? [];
    const accountContacts = contactsByCompany.get(key) ?? [];
    const company = companyById.get(key);
    const name = company?.company_name || accountCalls[0]?.account_name || accountContacts[0]?.email.split("@")[1] || "Unlinked account";
    const emails = new Set([...accountContacts.map((contact) => lower(contact.email)), ...accountCalls.map((call) => lower(call.prospect_email))]);
    const accountTasks = tasks.filter((task) => task.company_id === key || (task.prospect_email && emails.has(lower(task.prospect_email))) || lower(task.account_name) === lower(name));
    const sortedCalls = [...accountCalls].sort((a, b) => b.completed_at.localeCompare(a.completed_at));
    const answered = accountCalls.filter((call) => call.call_status === "Answered");
    const openTasks = accountTasks.filter(activeTask);
    const category = accountCategory(accountCalls, accountTasks, accountContacts);
    let score = 20;
    score += Math.min(25, openTasks.filter((task) => task.priority === "high").length * 12);
    score += Math.min(20, answered.length * 5);
    score += openTasks.some((task) => task.task_type === "meeting") ? 25 : 0;
    score += openTasks.some((task) => task.task_type === "referral") ? 15 : 0;
    score += openTasks.some((task) => task.task_type === "email") ? 10 : 0;
    score -= openTasks.some((task) => task.task_type === "cleanup") ? 10 : 0;
    score -= category.category === "Pause" ? 30 : 0;
    score -= category.category === "Do not contact" ? 100 : 0;
    return {
      key,
      companyId: company?.id ?? null,
      companyName: name,
      industry: company?.industry_auto_classified || accountCalls[0]?.industry || "Other / Unclassified",
      fitScore: company?.fit_score ?? null,
      category: category.category,
      reason: category.reason,
      nextAction: category.nextAction,
      priorityScore: Math.max(0, Math.min(100, score)),
      contacts: accountContacts.length || emails.size,
      attemptedContacts: new Set(accountCalls.map((call) => lower(call.prospect_email))).size,
      calls: accountCalls.length,
      connectedCalls: answered.length,
      callsOverMinute: answered.filter((call) => (call.duration_seconds ?? 0) >= 60).length,
      openTasks: openTasks.length,
      highPriorityTasks: openTasks.filter((task) => task.priority === "high").length,
      lastTouch: sortedCalls[0]?.completed_at ?? null,
      daysSinceLastTouch: dayDiff(sortedCalls[0]?.completed_at ?? null),
      latestNote: sortedCalls.find((call) => normalize(call.call_notes))?.call_notes ?? null
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore || b.openTasks - a.openTasks || b.calls - a.calls);

  const touchCounts = new Map<string, number>();
  for (const call of calls) touchCounts.set(lower(call.prospect_email), (touchCounts.get(lower(call.prospect_email)) ?? 0) + 1);
  const coverageBuckets = [
    { name: "No calls", min: 0, max: 0 },
    { name: "1 call", min: 1, max: 1 },
    { name: "2-3 calls", min: 2, max: 3 },
    { name: "4-6 calls", min: 4, max: 6 },
    { name: "7-9 calls", min: 7, max: 9 },
    { name: "10+ calls", min: 10, max: Number.POSITIVE_INFINITY }
  ].map((bucket) => ({ ...bucket, contacts: contacts.filter((contact) => { const count = touchCounts.get(lower(contact.email)) ?? 0; return count >= bucket.min && count <= bucket.max; }).length }));

  const totalDefinitive = calls.filter((call) => call.call_status !== "Not Logged");
  const totalAnswered = calls.filter((call) => call.call_status === "Answered");
  const baselineConnectRate = percentage(totalAnswered.length, totalDefinitive.length);
  const campaigns = [...new Set(calls.map((call) => call.call_source))].map((name) => {
    const rows = calls.filter((call) => call.call_source === name);
    const definitive = rows.filter((call) => call.call_status !== "Not Logged");
    const answered = rows.filter((call) => call.call_status === "Answered");
    const emails = new Set(rows.map((call) => lower(call.prospect_email)));
    const actionable = tasks.filter((task) => activeTask(task) && task.prospect_email && emails.has(lower(task.prospect_email)) && ["meeting", "email", "referral", "nurture"].includes(task.task_type)).length;
    const connectRate = percentage(answered.length, definitive.length);
    let recommendation = "Keep testing";
    if (definitive.length >= 100 && answered.length >= 2 && connectRate >= baselineConnectRate * 1.15) recommendation = "Prioritize";
    if (definitive.length >= 100 && !answered.length) recommendation = "Rework";
    return { name, calls: rows.length, prospects: emails.size, answered: answered.length, connectRate, actionable, actionRate: percentage(actionable, answered.length), recommendation };
  }).sort((a, b) => b.actionable - a.actionable || b.answered - a.answered || b.calls - a.calls);

  const activeTasks = tasks.filter(activeTask);
  const taskSummary = buildTaskDashboard(tasks).summary;
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      masterContacts: contacts.length,
      attemptedContacts: contacts.filter((contact) => touchCounts.has(lower(contact.email))).length,
      untouchedContacts: contacts.filter((contact) => !touchCounts.has(lower(contact.email))).length,
      totalAccounts: accounts.length,
      workNow: accounts.filter((account) => account.category === "Work now").length,
      findStakeholder: accounts.filter((account) => account.category === "Find stakeholder").length,
      paused: accounts.filter((account) => account.category === "Pause" || account.category === "Do not contact").length,
      cleanup: activeTasks.filter((task) => task.task_type === "cleanup" || task.task_type === "research").length,
      overdue: taskSummary.overdue
    },
    categories: ["Work now", "Find stakeholder", "Nurture", "Continue outreach", "Data cleanup", "Pause", "Do not contact"].map((name) => ({ name, accounts: accounts.filter((account) => account.category === name).length })),
    coverageBuckets,
    campaigns,
    accounts,
    cleanupTasks: activeTasks.filter((task) => task.task_type === "cleanup" || task.task_type === "research").sort((a, b) => (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1)).slice(0, 100),
    nextActions: activeTasks.filter((task) => task.task_type !== "cleanup").sort((a, b) => (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1)).slice(0, 20)
  };
}

export type PlanningCenter = ReturnType<typeof buildPlanningCenter>;
