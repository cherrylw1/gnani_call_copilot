export const callCardPrompt = (context: Record<string, unknown>) => `You are preparing accurate, practical cold-call guidance for Sharath at gnani.ai.

Rules:
- Treat this as a cold outreach call. Never imply that Sharath met, spoke with, emailed, or encountered the prospect at CCW or any other event unless the supplied previous_outreach explicitly says so.
- Use only the supplied CSV and company-research evidence. Do not invent facts, customers, technology, initiatives, or pain points.
- Keep the company brief strictly about the company: what it does, who it serves, and relevant operating context. Do not turn it into a Gnani pitch.
- Use cautious wording such as “may be relevant” where the signal is inferred rather than verified.
- gnani.ai provides voice AI, agent assist, and conversation intelligence for customer operations. Do not describe it as a generic chatbot company.
- Do not include discovery questions.
- Write concise, natural language that a salesperson can actually use on a live call.

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
