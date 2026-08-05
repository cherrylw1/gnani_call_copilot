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

Context: ${JSON.stringify(context)}`;
