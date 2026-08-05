const pickString = (value: unknown) => typeof value === "string" ? value : undefined;

const compactResearch = (value: unknown) => {
  const research = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    company_overview: pickString(research.company_overview),
    products_and_services: pickString(research.products_and_services),
    customer_segments: pickString(research.customer_segments),
    operating_footprint: pickString(research.operating_footprint),
    customer_operations_context: pickString(research.customer_operations_context),
    noteworthy_context: pickString(research.noteworthy_context),
    source_confidence: pickString(research.source_confidence),
    sources_reviewed: Array.isArray(research.sources)
      ? research.sources.map((source) => {
        const item = source && typeof source === "object" ? source as Record<string, unknown> : {};
        return { url: pickString(item.url), title: pickString(item.title) };
      })
      : []
  };
};

/**
 * Call-card generation needs the conclusions of account research, not the raw
 * HTML extracts. Keeping the context small makes bulk prefill both faster and
 * cheaper while preserving every fact the model is allowed to use.
 */
export const compactCallCardContext = (context: Record<string, unknown>) => {
  const contact = context.contact && typeof context.contact === "object" ? context.contact as Record<string, unknown> : {};
  const company = context.company && typeof context.company === "object" ? context.company as Record<string, unknown> : {};
  const signals = context.signals && typeof context.signals === "object" ? context.signals as Record<string, unknown> : {};
  return {
    contact: {
      first_name: pickString(contact.first_name),
      last_name: pickString(contact.last_name),
      full_name: pickString(contact.full_name),
      job_title: pickString(contact.job_title),
      persona: pickString(contact.persona),
      previous_outreach: pickString(contact.previous_outreach)
    },
    company: {
      company_name: pickString(company.company_name),
      industry: pickString(company.industry_auto_classified),
      country: pickString(company.country_primary),
      company_type: pickString(company.company_type),
      fit_score: company.fit_score,
      classification: pickString(company.buyer_partner_competitor_status),
      research: compactResearch(company.research_data)
    },
    signals: {
      priority_score: signals.priority_score_normalized,
      call_volume_band: pickString(signals.call_volume_band_raw),
      budgeting_period: pickString(signals.budgeting_period_raw),
      investing_voice_ai: pickString(signals.investing_voice_ai_raw),
      investing_conversational_ivr: pickString(signals.investing_conversational_ivr_raw),
      investing_chatbots: pickString(signals.investing_chatbots_raw),
      outsourcing_apac: pickString(signals.outsourcing_apac_raw),
      no_right_tech_partner: pickString(signals.no_right_tech_partner_raw)
    }
  };
};

export const callCardPrompt = (context: Record<string, unknown>) => `You are preparing accurate, practical cold-call guidance for Sharath at gnani.ai.

Rules:
- Treat this as a cold outreach call. Never imply that Sharath met, spoke with, emailed, or encountered the prospect at CCW or any other event unless the supplied previous_outreach explicitly says so.
- Use only the supplied CSV and company-research evidence. Do not invent facts, customers, technology, initiatives, or pain points.
- Keep the company brief strictly about the company: what it does, who it serves, and relevant operating context. Do not turn it into a Gnani pitch.
- Use cautious wording such as “may be relevant” where the signal is inferred rather than verified.
- gnani.ai provides voice AI, agent assist, and conversation intelligence for customer operations. Do not describe it as a generic chatbot company.
- Do not include discovery questions.
- Write concise, natural language that a salesperson can actually use on a live call.
- The elevator pitches are spoken mid-call scripts, addressed directly to the prospect. They must use the prospect's first name once, use natural "you/your/we" language, state what Gnani would add to the prospect's existing workflow, and must not contain a greeting, question, meeting ask, or closing.
- Create three distinct elevator-pitch lengths. Count words by whitespace before returning: detailed must be 65-90 words and no more than two sentences; medium must be 42-60 words and no more than two sentences; quick must be exactly one sentence and 28-36 words. Do not use a number, proof point, customer, technology, or initiative unless it appears in the supplied context. If evidence is limited, keep the pitch specific to the role and workflow category without inventing account facts.
- account_brief is a research-backed account profile. Keep verified company facts separate from Gnani relevance: workflow_hypotheses must explicitly say "Hypothesis to validate:" and must not be written as a confirmed customer problem. For a clinical, legal, or frontline individual-contributor title, role_context must say that ownership of technology or operations is not assumed.

Return valid JSON with exactly these keys:
{
  "lead_category": "",
  "fit_score": 0,
  "company_summary": "",
  "why_this_company": "",
  "best_gnani_angle": "",
  "recommended_products": [""],
  "cold_call_opener": "",
  "personalized_pitch": "",
  "account_brief": {
    "summary": "",
    "services": [""],
    "operating_facts": [""],
    "interaction_context": "",
    "role_context": "",
    "workflow_hypotheses": [""]
  },
  "elevator_pitches": {
    "detailed": "",
    "medium": "",
    "quick": ""
  },
  "objection_handles": {
    "not_a_priority": "",
    "already_have_a_solution": "",
    "send_me_information": "",
    "wrong_person": ""
  },
  "send_email_line": "",
  "meeting_ask": "",
  "demo_use_case": "",
  "source_confidence": ""
}

Context: ${JSON.stringify(compactCallCardContext(context))}`;
