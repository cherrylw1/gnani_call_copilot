export type MasterScriptInput = {
  firstName: string;
  companyName: string;
  companySummary?: string | null;
  industry?: string | null;
};

export type MasterScript = {
  opening: string;
  value: string;
  question: string;
  meetingAsk: string;
  ifInterested: string;
  ifSendInformation: string;
  ifExistingSolution: string;
  ifNotInterested: string;
  ifWrongPerson: string;
  ifBusy: string;
};

function tidy(value: string | null | undefined, fallback: string) {
  return value?.replace(/\s+/g, " ").trim() || fallback;
}

function companyContext(summary: string | null | undefined, companyName: string, industry: string | null | undefined) {
  const cleaned = summary?.replace(/\s+/g, " ").trim();
  if (cleaned) {
    const sentences = cleaned.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
    return sentences.replace(/[.!?]+$/, "");
  }
  if (industry?.trim()) return `${companyName} operates in the ${industry.trim()} space`;
  return `${companyName} runs customer-facing operations where call volume and consistency matter`;
}

export function buildMasterScript(input: MasterScriptInput): MasterScript {
  const firstName = tidy(input.firstName, "there");
  const companyName = tidy(input.companyName, "your organization");
  const context = companyContext(input.companySummary, companyName, input.industry);

  return {
    opening: `Hi ${firstName}, Sharath from Gnani.ai. I’m following up after CCW. From what I understand, ${context}. We help enterprise teams take pressure out of customer conversations by automating repeatable calls, supporting agents when conversations become complex, and giving leaders better visibility into what is happening across those interactions.`,
    value: `We normally start with one workflow that is creating volume, wait time, or manual effort, prove it inside the systems already in place, and then decide whether it is worth expanding. It could be a routine customer journey, a service or intake workflow, a live-agent support problem, or a quality and compliance visibility gap.`,
    question: `I do not want to make assumptions about ${companyName}. Which customer-contact workflow is most important for your team right now?`,
    meetingAsk: `That sounds like the kind of workflow we can map together. The next step would not be a broad platform presentation; it would be a short working session around that specific journey. Would Tuesday or Thursday be easier for a 12- to 15-minute conversation?`,
    ifInterested: `That is helpful context. Gnani can automate the repeatable part, guide the human agent through the complex moments, or surface quality and compliance patterns across the calls. Let’s use a short working session to see which of those actually fits.`,
    ifSendInformation: `Absolutely. I’ll send something concise around the workflow you mentioned. So it is useful rather than generic, I’ll focus it on that journey. If it looks relevant, can we reserve 12 minutes next week to decide whether it deserves a closer look?`,
    ifExistingSolution: `That makes sense. Most enterprise teams we speak with already have systems in place. We usually become relevant where there is still friction around repetitive calls, agent guidance, quality visibility, or workflow completion. Would it be unreasonable to compare what your current setup handles well with where there may still be a gap?`,
    ifNotInterested: `Understood. I won’t force it. The short version is that Gnani helps enterprise teams automate repeatable customer conversations, support agents during complex interactions, and understand the quality of those calls. If that becomes relevant later, you’ll know where to find me.`,
    ifWrongPerson: `Thanks for letting me know. Who normally owns customer-contact automation, contact-center technology, customer experience, or agent productivity on your side?`,
    ifBusy: `Understood. The reason for my call is simply that Gnani helps enterprise teams improve customer conversations without starting with a large replacement project. We usually begin with one workflow and prove it first. Is there a better time next week for a short conversation, or would you prefer a concise overview?`
  };
}

export function masterScriptText(input: MasterScriptInput) {
  const script = buildMasterScript(input);
  return [
    "MASTER SCRIPT — GNANI.AI",
    "",
    "OPENING",
    script.opening,
    "",
    "VALUE",
    script.value,
    "",
    "QUESTION",
    script.question,
    "",
    "MEETING ASK",
    script.meetingAsk,
    "",
    "IF THEY ARE INTERESTED",
    script.ifInterested,
    "",
    "IF THEY ASK FOR INFORMATION",
    script.ifSendInformation,
    "",
    "IF THEY ALREADY HAVE A SOLUTION",
    script.ifExistingSolution,
    "",
    "IF THEY ARE NOT INTERESTED",
    script.ifNotInterested,
    "",
    "IF YOU HAVE THE WRONG PERSON",
    script.ifWrongPerson,
    "",
    "IF THEY ARE BUSY",
    script.ifBusy
  ].join("\n");
}
