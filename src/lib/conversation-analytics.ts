import { applyReportFilters, type CallLogRow, type ReportFilters } from "@/lib/call-analytics";

const normalize = (value: string | null | undefined) => String(value ?? "").trim();
const has = (text: string, pattern: RegExp) => pattern.test(text);
const percentage = (part: number, whole: number) => whole ? part / whole : 0;
const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const patterns = {
  meeting: /\b(meeting|schedule|calendar|book(?:ed)?|set up a time|set a time)\b/i,
  evaluation: /\b(evaluat(?:e|ing|ion)|decision|decide|two weeks|next (?:week|month|quarter|year)|budget|roadmap|review)\b/i,
  referral: /\b(forward|proper lead|gave me a name|connect you|who (?:handles|owns))\b/i,
  sendInfo: /\b(send|share)\b.{0,28}\b(email|information|info|overview|details|case stud)/i,
  future: /\b(not now|future|later|few years|this year|next year|circle back|when they are ready)\b/i,
  existingSolution: /\b(already (?:using|implementing|have)|vendor|solution in place|internally|in-house|build their own|built their own|legacy)\b/i,
  competitor: /\b(competitor|do the same thing|same thing|partnership|partnerships)\b/i,
  wrongPerson: /\b(wrong (?:person|number|contact)|not the right (?:person|guy)|receptionist|not working for the company|left the company)\b/i,
  explicitInterest: /\b(interested|open to|take a look|worth a look|might reply|follow up|potential|could use|looking into)\b/i,
  noInterest: /\b(not(?:\s+\w+){0,2}\s+(?:interested|looking)|no (?:current )?need|don't need|doesn't need|do not need|good with that|all set|won't recommend|would not recommend)\b/i,
  suppress: /\b(do not call|don't call|not to call|stop contact|stop contacting|take (?:him|her|me) off|remove (?:him|her|me) from|calling list)\b/i,
  disconnected: /\b(disconnect|connection was not|connection was not proper|couldn't hear|could not hear|went to voicemail)\b/i,
  voiceAi: /\b(voice ai|voiceai|voice interactions?|voice automation)\b/i,
  automation: /\b(ai|automation|automate|agent assist|conversation intelligence)\b/i
};

export type ConversationCategory = "Follow up now" | "Referral path" | "Nurture" | "Competitive context" | "Closed / suppress" | "Conversation only";

export function classifyConversation(row: CallLogRow) {
  const note = normalize(row.call_notes);
  const duration = row.duration_seconds ?? 0;
  const flags = Object.fromEntries(Object.entries(patterns).map(([key, pattern]) => [key, has(note, pattern)])) as Record<keyof typeof patterns, boolean>;
  if (flags.noInterest || flags.suppress) flags.explicitInterest = false;
  let score = 0;
  if (flags.meeting) score += 6;
  if (flags.evaluation) score += 4;
  if (flags.referral) score += 3;
  if (flags.sendInfo) score += 2;
  if (flags.explicitInterest) score += 3;
  if (duration >= 60) score += 1;
  if (duration >= 120) score += 1;
  if (note.length >= 140) score += 1;
  if (flags.future) score += 1;
  if (flags.noInterest) score -= 4;
  if (flags.suppress) score -= 8;
  if (flags.wrongPerson && !flags.referral) score -= 3;
  if (flags.disconnected) score -= 3;

  let category: ConversationCategory = "Conversation only";
  if (flags.suppress || (flags.wrongPerson && !flags.referral) || (flags.noInterest && !flags.future && !flags.sendInfo && !flags.referral && !flags.evaluation)) category = "Closed / suppress";
  else if (flags.meeting || (flags.evaluation && flags.sendInfo)) category = "Follow up now";
  else if (flags.referral) category = "Referral path";
  else if (flags.explicitInterest && score >= 6) category = "Follow up now";
  else if (flags.future || flags.sendInfo || flags.evaluation || score >= 3) category = "Nurture";
  else if (flags.existingSolution || flags.competitor) category = "Competitive context";

  const reasons: string[] = [];
  if (flags.meeting) reasons.push("Meeting language");
  if (flags.evaluation) reasons.push("Evaluation or timing signal");
  if (flags.referral) reasons.push("Referral or stakeholder path");
  if (flags.sendInfo) reasons.push("Email follow-up mentioned");
  if (flags.explicitInterest) reasons.push("Interest language");
  if (flags.existingSolution) reasons.push("Existing solution");
  if (flags.competitor) reasons.push("Competitive context");
  if (flags.future) reasons.push("Future timing");
  if (flags.suppress) reasons.push("Suppression request");
  if (flags.wrongPerson) reasons.push("Contact mismatch");
  if (duration >= 60) reasons.push("Call exceeded one minute");

  let recommendedAction = "Review the note before taking another step.";
  if (category === "Follow up now") recommendedAction = flags.meeting ? "Confirm the meeting or send a specific scheduling follow-up." : "Send a tailored follow-up while the conversation is recent.";
  if (category === "Referral path") recommendedAction = "Identify the named or implied stakeholder and reference this conversation.";
  if (category === "Nurture") recommendedAction = flags.future ? "Record the timing cue and schedule a relevant future follow-up." : "Send a concise account-specific follow-up only if the note supports it.";
  if (category === "Competitive context") recommendedAction = "Use this as market learning. Do not treat duration alone as buying interest.";
  if (category === "Closed / suppress") recommendedAction = flags.suppress ? "Suppress this contact from further calling." : "Do not prioritize another call without a new signal.";

  const tags: string[] = [];
  if (flags.voiceAi) tags.push("Voice AI");
  if (flags.automation) tags.push("AI / automation");
  if (flags.existingSolution) tags.push("Existing solution");
  if (flags.competitor) tags.push("Competitor / partner");
  if (flags.referral) tags.push("Referral");
  if (flags.sendInfo) tags.push("Email follow-up");
  if (flags.evaluation) tags.push("Evaluation window");
  return { score, category, reasons, recommendedAction, tags, flags };
}

function durationBand(seconds: number) {
  if (seconds < 30) return "Under 30 sec";
  if (seconds < 60) return "30-59 sec";
  if (seconds < 180) return "1-3 min";
  return "3+ min";
}

function buildSegmentRows(rows: CallLogRow[], key: (row: CallLogRow) => string) {
  const groups = new Map<string, CallLogRow[]>();
  for (const row of rows) {
    const name = key(row) || "Unknown";
    groups.set(name, [...(groups.get(name) ?? []), row]);
  }
  return [...groups].map(([name, calls]) => {
    const durations = calls.map((row) => row.duration_seconds ?? 0);
    const classified = calls.map((row) => classifyConversation(row));
    const actionable = classified.filter((item) => ["Follow up now", "Referral path", "Nurture"].includes(item.category)).length;
    return {
      name,
      connectedCalls: calls.length,
      medianSeconds: median(durations),
      averageSeconds: durations.reduce((sum, value) => sum + value, 0) / calls.length,
      overOneMinute: durations.filter((value) => value >= 60).length,
      overOneMinuteRate: percentage(durations.filter((value) => value >= 60).length, calls.length),
      actionable,
      actionableRate: percentage(actionable, calls.length)
    };
  }).sort((a, b) => b.actionable - a.actionable || b.connectedCalls - a.connectedCalls);
}

export function buildConversationInsights(allRows: CallLogRow[], filters: ReportFilters, latestImport: { created_at?: string; file_name?: string } | null) {
  const periodRows = applyReportFilters(allRows, filters, true);
  const connected = periodRows.filter((row) => row.call_status === "Answered");
  const analyzed = connected.map((row) => ({ ...row, analysis: classifyConversation(row) }));
  const durations = connected.map((row) => row.duration_seconds ?? 0);
  const withNotes = connected.filter((row) => normalize(row.call_notes));
  const actionableCategories: ConversationCategory[] = ["Follow up now", "Referral path", "Nurture"];
  const followUps = analyzed.filter((item) => actionableCategories.includes(item.analysis.category)).sort((a, b) => b.analysis.score - a.analysis.score || (b.duration_seconds ?? 0) - (a.duration_seconds ?? 0));
  const highlights = analyzed.filter((item) => item.analysis.category !== "Conversation only" || item.analysis.score >= 2).sort((a, b) => b.analysis.score - a.analysis.score || (b.duration_seconds ?? 0) - (a.duration_seconds ?? 0));

  const thresholds = [
    { name: "30+ seconds", seconds: 30 },
    { name: "1+ minute", seconds: 60 },
    { name: "3+ minutes", seconds: 180 },
    { name: "5+ minutes", seconds: 300 }
  ].map((item) => ({ ...item, calls: durations.filter((value) => value >= item.seconds).length, share: percentage(durations.filter((value) => value >= item.seconds).length, connected.length) }));
  const bands = ["Under 30 sec", "30-59 sec", "1-3 min", "3+ min"].map((name) => ({ name, calls: durations.filter((value) => durationBand(value) === name).length }));

  const objectionDefinitions = [
    { name: "Not now / no need", test: (item: ReturnType<typeof classifyConversation>) => item.flags.noInterest || item.flags.future },
    { name: "Existing solution", test: (item: ReturnType<typeof classifyConversation>) => item.flags.existingSolution },
    { name: "Wrong contact", test: (item: ReturnType<typeof classifyConversation>) => item.flags.wrongPerson },
    { name: "Competitive context", test: (item: ReturnType<typeof classifyConversation>) => item.flags.competitor },
    { name: "Do not call", test: (item: ReturnType<typeof classifyConversation>) => item.flags.suppress },
    { name: "Disconnected / call quality", test: (item: ReturnType<typeof classifyConversation>) => item.flags.disconnected }
  ];
  const objections = objectionDefinitions.map((definition) => ({ name: definition.name, calls: analyzed.filter((item) => definition.test(item.analysis)).length })).sort((a, b) => b.calls - a.calls);
  const topicNames = ["Voice AI", "AI / automation", "Existing solution", "Competitor / partner", "Referral", "Email follow-up", "Evaluation window"];
  const topics = topicNames.map((name) => ({ name, calls: analyzed.filter((item) => item.analysis.tags.includes(name)).length })).sort((a, b) => b.calls - a.calls);

  const categoryNames: ConversationCategory[] = ["Follow up now", "Referral path", "Nurture", "Competitive context", "Closed / suppress", "Conversation only"];
  const categories = categoryNames.map((name) => ({ name, calls: analyzed.filter((item) => item.analysis.category === name).length }));
  const explicitNextAction = analyzed.filter((item) => item.analysis.flags.meeting || item.analysis.flags.referral || item.analysis.flags.sendInfo || item.analysis.flags.evaluation).length;

  return {
    generatedAt: new Date().toISOString(),
    latestImport,
    sourceRange: allRows.length ? { min: allRows.at(-1)?.completed_at, max: allRows[0]?.completed_at } : null,
    filters,
    options: {
      callSources: [...new Set(allRows.map((row) => row.call_source).filter(Boolean))].sort(),
      personas: [...new Set(allRows.map((row) => row.persona_segment).filter((value): value is string => Boolean(value)))].sort(),
      industries: [...new Set(allRows.map((row) => row.industry).filter((value): value is string => Boolean(value)))].sort()
    },
    summary: {
      connectedCalls: connected.length,
      callsWithNotes: withNotes.length,
      noteCoverage: percentage(withNotes.length, connected.length),
      medianSeconds: median(durations),
      averageSeconds: durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : 0,
      followUpNow: analyzed.filter((item) => item.analysis.category === "Follow up now").length,
      actionable: followUps.length,
      explicitNextAction,
      nextActionCoverage: percentage(explicitNextAction, connected.length),
      suppressionRequests: analyzed.filter((item) => item.analysis.flags.suppress).length,
      longestSeconds: durations.length ? Math.max(...durations) : 0
    },
    thresholds,
    bands,
    categories,
    objections,
    topics,
    followUps: followUps.slice(0, 50),
    highlights: highlights.slice(0, 80),
    longestCalls: [...analyzed].sort((a, b) => (b.duration_seconds ?? 0) - (a.duration_seconds ?? 0)).slice(0, 20),
    campaigns: buildSegmentRows(connected, (row) => row.call_source),
    personas: buildSegmentRows(connected, (row) => row.persona_segment ?? "Other")
  };
}

export type ConversationInsights = ReturnType<typeof buildConversationInsights>;
