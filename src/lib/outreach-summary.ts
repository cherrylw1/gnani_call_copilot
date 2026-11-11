export const outreachSummary = {
  period: "July 10–September 29, 2026",
  headline: "The outreach reached 1,208 accounts and 2,344 leads through 32,667 phone attempts, resulting in 387 connected conversations, 2 confirmed SAL accounts, ₹3,00,000 in monthly recurring revenue, and 15 US meetings.",
  reach: [
    { label: "Accounts reached", value: "1,208", detail: "Unique accounts with outreach activity", tone: "emerald" },
    { label: "Leads reached", value: "2,344", detail: "Unique prospects across those accounts", tone: "sky" },
    { label: "Phone attempts", value: "32,667", detail: "Deduplicated outbound calls", tone: "violet" },
    { label: "Connection rate", value: "1.77%", detail: "387 connected conversations", tone: "amber" }
  ],
  conversations: [
    { label: "Connected conversations", value: "387", detail: "Calls marked as answered" },
    { label: "Leads with conversations", value: "363", detail: "At least one connected call" },
    { label: "Email follow-up requests", value: "24", detail: "Prospects asked for information" },
    { label: "Stakeholder handoffs", value: "10", detail: "Referrals or owner introductions" }
  ],
  meetings: [
    { label: "Identified in calls", value: "8", detail: "Meeting or scheduling agreements" },
    { label: "Upcoming meetings", value: "10", detail: "Current meeting list" },
    { label: "US meetings combined", value: "15", detail: "Reported combined total" }
  ],
  pipeline: {
    salCount: "2",
    salAccounts: ["TCL Philippines", "Dubai Islamic Bank"],
    mrr: "₹3,00,000",
    mrrDetail: "Monthly recurring revenue across both SAL accounts"
  }
} as const;

export type OutreachSummary = typeof outreachSummary;
