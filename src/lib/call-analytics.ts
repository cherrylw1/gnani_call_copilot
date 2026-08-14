export type CallLogRow = {
  id: string;
  call_id: string | null;
  prospect_email: string;
  prospect_name: string;
  account_name: string;
  completed_at: string;
  call_source: string;
  prospect_status: string;
  call_type: string | null;
  purpose: string | null;
  call_status: string;
  call_notes: string | null;
  outcome: string | null;
  duration_seconds: number | null;
  shareable_link: string | null;
  from_number: string | null;
  to_number: string | null;
  job_title: string | null;
  persona_segment: string | null;
  industry: string | null;
};

export type ReportFilters = {
  from?: string;
  to?: string;
  callSource?: string;
  persona?: string;
  industry?: string;
  status?: string;
  account?: string;
};

const definitiveStatus = (status: string) => status !== "Not Logged";
const normalize = (value: string | null | undefined) => String(value ?? "").trim();
const unique = (values: string[]) => new Set(values.filter(Boolean)).size;
const percentage = (part: number, whole: number) => whole ? part / whole : 0;
const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const istDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
const displayDay = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric" });
const dayKey = (iso: string) => istDay.format(new Date(iso));

export function applyReportFilters(rows: CallLogRow[], filters: ReportFilters, includeDate = true) {
  return rows.filter((row) => {
    const date = dayKey(row.completed_at);
    if (includeDate && filters.from && date < filters.from) return false;
    if (includeDate && filters.to && date > filters.to) return false;
    if (filters.callSource && row.call_source !== filters.callSource) return false;
    if (filters.persona && row.persona_segment !== filters.persona) return false;
    if (filters.industry && row.industry !== filters.industry) return false;
    if (filters.status && row.call_status !== filters.status) return false;
    if (filters.account && row.account_name !== filters.account) return false;
    return true;
  });
}

function groupCount(rows: CallLogRow[], key: (row: CallLogRow) => string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = key(row) || "Unknown";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function buildBreakdown(rows: CallLogRow[], key: (row: CallLogRow) => string) {
  return [...groupCount(rows, key)].map(([name, calls]) => {
    const subset = rows.filter((row) => (key(row) || "Unknown") === name);
    const answered = subset.filter((row) => row.call_status === "Answered").length;
    const definitive = subset.filter((row) => definitiveStatus(row.call_status)).length;
    const connectRate = percentage(answered, definitive);
    const shareOfCalls = percentage(calls, rows.length);
    const z = 1.96;
    const denominator = 1 + (z * z) / Math.max(definitive, 1);
    const centre = connectRate + (z * z) / (2 * Math.max(definitive, 1));
    const margin = z * Math.sqrt((connectRate * (1 - connectRate) + (z * z) / (4 * Math.max(definitive, 1))) / Math.max(definitive, 1));
    return {
      name,
      calls,
      prospects: unique(subset.map((row) => row.prospect_email)),
      accounts: unique(subset.map((row) => row.account_name.toLowerCase())),
      answered,
      definitive,
      connectRate,
      shareOfCalls,
      callsPerConnect: answered ? calls / answered : null,
      confidenceFloor: definitive ? Math.max(0, (centre - margin) / denominator) : 0,
      voicemailRate: percentage(subset.filter((row) => row.call_status === "Voice Mail").length, subset.length),
      errorRate: percentage(subset.filter((row) => row.call_status === "Errored").length, subset.length)
    };
  }).sort((a, b) => b.calls - a.calls);
}

function prospectRows(periodRows: CallLogRow[], lifetimeRows: CallLogRow[]) {
  const period = new Map<string, CallLogRow[]>();
  const lifetime = groupCount(lifetimeRows, (row) => row.prospect_email);
  for (const row of periodRows) {
    const list = period.get(row.prospect_email) ?? [];
    list.push(row);
    period.set(row.prospect_email, list);
  }
  return [...period].map(([email, calls]) => {
    const sorted = [...calls].sort((a, b) => a.completed_at.localeCompare(b.completed_at));
    const latest = sorted.at(-1)!;
    const answered = calls.filter((row) => row.call_status === "Answered").length;
    return {
      email,
      prospect: latest.prospect_name,
      account: latest.account_name,
      jobTitle: latest.job_title ?? "",
      persona: latest.persona_segment ?? "Other",
      industry: latest.industry ?? "Other / Unclassified",
      periodTouches: calls.length,
      lifetimeTouches: lifetime.get(email) ?? calls.length,
      daysTouched: unique(calls.map((row) => dayKey(row.completed_at))),
      answered,
      firstTouch: sorted[0].completed_at,
      lastTouch: latest.completed_at,
      lastStatus: latest.call_status,
      totalDuration: calls.reduce((sum, row) => sum + (row.duration_seconds ?? 0), 0)
    };
  }).sort((a, b) => b.periodTouches - a.periodTouches || a.prospect.localeCompare(b.prospect));
}

function touchpointDistribution(prospects: ReturnType<typeof prospectRows>) {
  const buckets = [
    { name: "1 touch", min: 1, max: 1 },
    { name: "2-3 touches", min: 2, max: 3 },
    { name: "4-6 touches", min: 4, max: 6 },
    { name: "7-9 touches", min: 7, max: 9 },
    { name: "10+ touches", min: 10, max: Number.POSITIVE_INFINITY }
  ];
  return buckets.map((bucket) => ({
    name: bucket.name,
    prospects: prospects.filter((item) => item.periodTouches >= bucket.min && item.periodTouches <= bucket.max).length
  }));
}

export function buildCallReport(allRows: CallLogRow[], filters: ReportFilters, masterContactCount: number, latestImport: { created_at?: string; file_name?: string } | null) {
  const periodRows = applyReportFilters(allRows, filters, true);
  const lifetimeRows = applyReportFilters(allRows, filters, false);
  const prospects = prospectRows(periodRows, lifetimeRows);
  const answeredRows = periodRows.filter((row) => row.call_status === "Answered");
  const definitiveRows = periodRows.filter((row) => definitiveStatus(row.call_status));
  const uniqueProspects = unique(periodRows.map((row) => row.prospect_email));
  const uniqueAccounts = unique(periodRows.map((row) => row.account_name.toLowerCase()));
  const activeDays = unique(periodRows.map((row) => dayKey(row.completed_at)));
  const answeredDurations = answeredRows.map((row) => row.duration_seconds).filter((value): value is number => value !== null);

  const dailyMap = new Map<string, CallLogRow[]>();
  for (const row of periodRows) {
    const key = dayKey(row.completed_at);
    const list = dailyMap.get(key) ?? [];
    list.push(row);
    dailyMap.set(key, list);
  }
  const daily = [...dailyMap].sort(([a], [b]) => a.localeCompare(b)).map(([date, rows]) => {
    const definitive = rows.filter((row) => definitiveStatus(row.call_status)).length;
    const answered = rows.filter((row) => row.call_status === "Answered").length;
    return { date, label: displayDay.format(new Date(rows[0].completed_at)), calls: rows.length, prospects: unique(rows.map((row) => row.prospect_email)), answered, connectRate: percentage(answered, definitive) };
  });

  const statuses = ["Answered", "Voice Mail", "Not Answered", "Not Logged", "Errored", "Ivr", "Call Screener"].map((name) => {
    const calls = periodRows.filter((row) => row.call_status === name).length;
    return { name, calls, share: percentage(calls, periodRows.length), prospects: unique(periodRows.filter((row) => row.call_status === name).map((row) => row.prospect_email)) };
  });
  const outcomes = ["Neutral", "Wrong contact", "Negative", "Not set", "Missing"].map((name) => {
    const calls = answeredRows.filter((row) => name === "Missing" ? !normalize(row.outcome) : row.outcome === name).length;
    return { name, calls, share: percentage(calls, answeredRows.length) };
  });

  const accounts = buildBreakdown(periodRows, (row) => row.account_name).slice(0, 50);
  const campaigns = buildBreakdown(periodRows, (row) => row.call_source);
  const personas = buildBreakdown(periodRows, (row) => row.persona_segment ?? "Other");
  const industries = buildBreakdown(periodRows, (row) => row.industry ?? "Other / Unclassified");
  const outboundNumbers = buildBreakdown(periodRows, (row) => row.from_number ?? "Unknown");
  const outcomeCaptured = answeredRows.filter((row) => normalize(row.outcome)).length;
  const notesCaptured = periodRows.filter((row) => normalize(row.call_notes)).length;
  const summary = {
    totalCalls: periodRows.length,
    definitiveCalls: definitiveRows.length,
    uniqueProspects,
    uniqueAccounts,
    answeredCalls: answeredRows.length,
    uniqueReached: unique(answeredRows.map((row) => row.prospect_email)),
    connectRate: percentage(answeredRows.length, definitiveRows.length),
    rawAnswerRate: percentage(answeredRows.length, periodRows.length),
    voicemailRate: percentage(periodRows.filter((row) => row.call_status === "Voice Mail").length, periodRows.length),
    errorRate: percentage(periodRows.filter((row) => row.call_status === "Errored").length, periodRows.length),
    averageTouches: percentage(periodRows.length, uniqueProspects),
    activeDays,
    callsPerActiveDay: percentage(periodRows.length, activeDays),
    totalTalkSeconds: answeredDurations.reduce((sum, value) => sum + value, 0),
    medianAnsweredSeconds: median(answeredDurations),
    outcomeCaptured,
    outcomeCoverage: percentage(outcomeCaptured, answeredRows.length),
    notesCaptured,
    masterContactCount,
    listCoverage: percentage(uniqueProspects, masterContactCount)
  };

  const addSignals = (items: ReturnType<typeof buildBreakdown>) => items.map((item) => {
    const enoughSignal = item.definitive >= 40 && item.answered >= 2;
    const lowVolume = item.calls < Math.max(30, periodRows.length * 0.035);
    let signal: "Prioritize" | "Keep testing" | "Rework" | "No signal" = "No signal";
    if (enoughSignal && item.connectRate >= summary.connectRate * 1.15) signal = "Prioritize";
    else if (lowVolume || item.answered < 2) signal = "Keep testing";
    else if (item.connectRate < summary.connectRate * 0.7) signal = "Rework";
    else signal = "Keep testing";
    return { ...item, signal };
  }).sort((a, b) => b.confidenceFloor - a.confidenceFloor || b.calls - a.calls);

  const insights = [
    `${uniqueProspects.toLocaleString()} prospects across ${uniqueAccounts.toLocaleString()} accounts received at least one call in this period.`,
    `The team completed ${periodRows.length.toLocaleString()} call touchpoints, averaging ${summary.averageTouches.toFixed(1)} per attempted prospect.`,
    `${(summary.voicemailRate * 100).toFixed(1)}% of call records reached voicemail; ${(summary.connectRate * 100).toFixed(2)}% of calls with a definitive status were answered.`,
    `${summary.uniqueReached.toLocaleString()} unique prospects answered at least once, across ${unique(answeredRows.map((row) => row.account_name.toLowerCase())).toLocaleString()} accounts.`,
    `${periodRows.filter((row) => row.call_status === "Not Logged").length.toLocaleString()} records have no definitive logged status.`,
    `Outcome information is present for ${outcomeCaptured.toLocaleString()} of ${answeredRows.length.toLocaleString()} answered calls.`
  ];

  return {
    generatedAt: new Date().toISOString(),
    latestImport,
    sourceRange: allRows.length ? { min: allRows.at(-1)?.completed_at, max: allRows[0]?.completed_at } : null,
    filters,
    options: {
      callSources: [...new Set(allRows.map((row) => row.call_source).filter(Boolean))].sort(),
      personas: [...new Set(allRows.map((row) => row.persona_segment).filter((value): value is string => Boolean(value)))].sort(),
      industries: [...new Set(allRows.map((row) => row.industry).filter((value): value is string => Boolean(value)))].sort(),
      statuses: [...new Set(allRows.map((row) => row.call_status).filter(Boolean))].sort(),
      accounts: [...new Set(allRows.map((row) => row.account_name).filter(Boolean))].sort()
    },
    summary,
    daily,
    statuses,
    outcomes,
    campaigns: addSignals(campaigns),
    personas: addSignals(personas),
    industries,
    outboundNumbers,
    touchpointDistribution: touchpointDistribution(prospects),
    prospects,
    accounts,
    insights,
    connectedCalls: [...answeredRows].sort((a, b) => b.completed_at.localeCompare(a.completed_at)).slice(0, 12),
    recentCalls: [...periodRows].sort((a, b) => b.completed_at.localeCompare(a.completed_at)).slice(0, 150)
  };
}

export type CallReport = ReturnType<typeof buildCallReport>;

export type CallDetailScope = "all" | "answered" | "prospect" | "status" | "outcome" | "campaign" | "persona" | "industry" | "account" | "outbound" | "touchpoint" | "day";

function inTouchpointBucket(count: number, bucket: string) {
  if (bucket === "1 touch") return count === 1;
  if (bucket === "2-3 touches") return count >= 2 && count <= 3;
  if (bucket === "4-6 touches") return count >= 4 && count <= 6;
  if (bucket === "7-9 touches") return count >= 7 && count <= 9;
  return bucket === "10+ touches" ? count >= 10 : true;
}

export function buildCallDetails(
  allRows: CallLogRow[],
  filters: ReportFilters,
  options: { scope: CallDetailScope; value?: string; search?: string; page?: number; pageSize?: number }
) {
  const baseRows = applyReportFilters(allRows, filters, true);
  const value = normalize(options.value);
  let rows = baseRows;
  if (options.scope === "answered") rows = rows.filter((row) => row.call_status === "Answered");
  if (options.scope === "prospect") rows = rows.filter((row) => row.prospect_email === value);
  if (options.scope === "status") rows = rows.filter((row) => row.call_status === value);
  if (options.scope === "outcome") rows = rows.filter((row) => value === "Missing" ? !normalize(row.outcome) : row.outcome === value);
  if (options.scope === "campaign") rows = rows.filter((row) => row.call_source === value);
  if (options.scope === "persona") rows = rows.filter((row) => (row.persona_segment ?? "Other") === value);
  if (options.scope === "industry") rows = rows.filter((row) => (row.industry ?? "Other / Unclassified") === value);
  if (options.scope === "account") rows = rows.filter((row) => row.account_name === value);
  if (options.scope === "outbound") rows = rows.filter((row) => (row.from_number ?? "Unknown") === value);
  if (options.scope === "day") rows = rows.filter((row) => dayKey(row.completed_at) === value);
  if (options.scope === "touchpoint") {
    const counts = groupCount(baseRows, (row) => row.prospect_email);
    rows = rows.filter((row) => inTouchpointBucket(counts.get(row.prospect_email) ?? 0, value));
  }
  const search = normalize(options.search).toLowerCase();
  if (search) rows = rows.filter((row) => [row.prospect_name, row.prospect_email, row.job_title, row.account_name, row.industry, row.call_notes, row.outcome, row.call_status].some((field) => normalize(field).toLowerCase().includes(search)));
  rows = [...rows].sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  const pageSize = Math.min(100, Math.max(10, options.pageSize ?? 30));
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(pageCount, Math.max(1, options.page ?? 1));
  return {
    total: rows.length,
    uniqueProspects: unique(rows.map((row) => row.prospect_email)),
    uniqueAccounts: unique(rows.map((row) => row.account_name.toLowerCase())),
    page,
    pageCount,
    rows: rows.slice((page - 1) * pageSize, page * pageSize)
  };
}

export type CallDetails = ReturnType<typeof buildCallDetails>;
