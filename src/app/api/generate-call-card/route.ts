import { NextResponse } from "next/server";
import { z } from "zod";
import { CALL_CARD_RECIPE_VERSION, createFallbackElevatorPitches, isCurrentAccountBrief, isCurrentElevatorPitches, type AccountBrief } from "@/lib/call-card-recipe";
import { COMPANY_RESEARCH_RECIPE_VERSION, researchAndSaveCompany } from "@/lib/company-research";
import { getContactContext } from "@/lib/contact-context";
import { openRouterJson } from "@/lib/openrouter";
import { callCardPrompt } from "@/lib/prompts/call-card";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const researchValue = (research: unknown, key: string) => {
  if (!research || typeof research !== "object") return "";
  const value = (research as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

const researchSources = (research: unknown) => {
  if (!research || typeof research !== "object") return [];
  const sources = (research as Record<string, unknown>).sources;
  return Array.isArray(sources) ? sources : [];
};

const roleContext = (role: string) => {
  if (/doctor|physician|nurse|clinician|surgeon|therapist|pharmacist/i.test(role)) return `The contact is a ${role}. They are a clinical stakeholder; ownership of patient-access technology, contact-center operations, or purchasing is not assumed.`;
  if (/manager|director|vice president|vp|chief|cio|cto|coo|head of/i.test(role)) return `The contact's ${role} title may indicate operational or functional influence, but the card should still distinguish verified ownership from an inferred buying role.`;
  return `The contact is listed as ${role}. Ownership of a specific workflow or technology decision should be confirmed rather than assumed.`;
};

const workflowHypotheses = (industry: string | null | undefined) => {
  if (/health|medical|hospital|care/i.test(industry || "")) return ["Hypothesis to validate: patient access, appointment scheduling, billing or service inquiries may be high-volume journeys where voice automation or live agent guidance could be relevant.", "Hypothesis to validate: interaction analytics may help operational teams understand patient-service demand, repeat contacts, and coaching opportunities after the relevant privacy and clinical-governance review."];
  return ["Hypothesis to validate: identify one repeatable customer interaction that could be automated or routed with context.", "Hypothesis to validate: identify one human-handled interaction where live guidance, summaries, or conversation analytics would be more valuable than a generic platform discussion."];
};

const accountBriefFromResearch = (context: NonNullable<Awaited<ReturnType<typeof getContactContext>>>): AccountBrief => {
  const company = context.company;
  const research = company?.research_data;
  const summary = researchValue(research, "company_overview") || "Research is required before an account brief can be treated as verified.";
  const services = [researchValue(research, "products_and_services") || "Not established from the reviewed sources."].filter(Boolean);
  const operatingFacts = [researchValue(research, "operating_footprint"), researchValue(research, "noteworthy_context")].filter(Boolean);
  return {
    summary,
    services,
    operating_facts: operatingFacts.length ? operatingFacts : ["Not established from the reviewed sources."],
    interaction_context: researchValue(research, "customer_operations_context") || "Not established from the reviewed sources.",
    role_context: roleContext(context.contact.job_title || context.contact.persona || "an unspecified role"),
    workflow_hypotheses: workflowHypotheses(company?.industry_auto_classified)
  };
};

async function ensureResearch(context: NonNullable<Awaited<ReturnType<typeof getContactContext>>>) {
  const company = context.company;
  if (!company) throw new Error("This contact is not linked to a company. Add a company and non-generic domain before preparing a brief.");
  if (company.research_status === "completed" && company.research_data && company.research_recipe_version === COMPANY_RESEARCH_RECIPE_VERSION) return context;
  const research = await researchAndSaveCompany({ id: company.id, domain: company.domain });
  return { ...context, company: { ...company, research_status: "completed", research_summary: research.company_overview, research_data: research } };
}

const fallback = (context: NonNullable<Awaited<ReturnType<typeof getContactContext>>>) => {
  const company = context.company;
  const research = company?.research_data;
  const role = context.contact.job_title || context.contact.persona || "customer-operations leader";
  const accountBrief = accountBriefFromResearch(context);
  const sourceCount = researchSources(research).length;
  return {
    lead_category: company?.buyer_partner_competitor_status ?? "Needs review",
    fit_score: Number(company?.fit_score ?? 0),
    company_summary: accountBrief.summary,
    why_this_company: accountBrief.role_context,
    best_gnani_angle: "Start with one confirmed customer-interaction workflow, then decide whether bounded voice automation, live agent guidance, or interaction analytics is the relevant layer.",
    recommended_products: ["AI Voice Agents", "Agent Assist", "Conversation Intelligence"],
    cold_call_opener: `Hi ${context.contact.first_name || "there"}, this is Sharath from gnani.ai. We help customer-facing teams make high-volume voice interactions easier to handle with voice AI and agent assist.`,
    personalized_pitch: `Gnani can support ${company?.company_name || "your organization"} by automating appropriate voice interactions, assisting agents during live conversations, and surfacing quality insights—starting with one confirmed workflow rather than a broad transformation claim.`,
    account_brief: accountBrief,
    elevator_pitches: createFallbackElevatorPitches({ firstName: context.contact.first_name, companyName: company?.company_name, role }),
    discovery_questions: [],
    objection_handles: {
      not_a_priority: "Understood. I’ll keep this brief—if customer-call efficiency becomes a priority, would it be helpful to have a relevant example on hand?",
      already_have_a_solution: "That makes sense. We often complement an existing stack where voice automation, live agent guidance, or conversation-quality visibility still has gaps.",
      send_me_information: "Absolutely. I’ll send a short note focused on the customer-interaction workflow most likely to be relevant, without assuming a current project.",
      wrong_person: "Thanks for letting me know. Who typically owns customer operations, contact-center technology, or automation priorities?"
    },
    send_email_line: "I’ll send a concise note on where Gnani can support voice automation, agent assist, and conversation intelligence for customer operations.",
    meeting_ask: "If the topic is relevant, would a 20-minute working session next week be worthwhile?",
    demo_use_case: "Show one confirmed customer-interaction workflow—from inbound voice automation to agent guidance and quality visibility—rather than a generic platform tour.",
    source_confidence: `Verified public company research: ${sourceCount} source${sourceCount === 1 ? "" : "s"} reviewed. Workflow relevance is labelled as a hypothesis.`
  };
};

export async function POST(request: Request) {
  try {
    const { email, refresh, strict } = z.object({ email: z.string().email(), refresh: z.boolean().optional(), strict: z.boolean().optional() }).parse(await request.json());
    const initialContext = await getContactContext(email);
    if (!initialContext) return NextResponse.json({ error: "No contact found for this email." }, { status: 404 });
    if (!refresh && initialContext.card?.brief_recipe_version === CALL_CARD_RECIPE_VERSION && isCurrentElevatorPitches(initialContext.card.elevator_pitches) && isCurrentAccountBrief(initialContext.card.account_brief)) {
      return NextResponse.json({ card: initialContext.card, fallback: initialContext.card.generated_by_model === "rule-based", cached: true });
    }

    const context = await ensureResearch(initialContext);
    const baseCard = fallback(context);
    let card = baseCard;
    let model = "rule-based";
    try {
      const result = await openRouterJson<typeof card>(callCardPrompt(context), 1100);
      const generated = result.data;
      card = {
        ...baseCard,
        ...generated,
        account_brief: isCurrentAccountBrief(generated.account_brief) ? generated.account_brief : baseCard.account_brief,
        elevator_pitches: isCurrentElevatorPitches(generated.elevator_pitches) ? generated.elevator_pitches : baseCard.elevator_pitches,
        source_confidence: baseCard.source_confidence,
        discovery_questions: [],
        recommended_products: Array.isArray(generated.recommended_products) ? generated.recommended_products : baseCard.recommended_products,
        objection_handles: { ...baseCard.objection_handles, ...(generated.objection_handles && typeof generated.objection_handles === "object" ? generated.objection_handles : {}) }
      };
      model = result.model;
    } catch (modelError) {
      if (strict) throw modelError;
      // A research-backed fallback lets the caller proceed if a model is unavailable.
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from("lead_intelligence_cards").insert({ contact_id: context.contact.id, company_id: context.company?.id ?? null, ...card, recommended_products: card.recommended_products, discovery_questions: [], objection_handles: card.objection_handles, brief_recipe_version: CALL_CARD_RECIPE_VERSION, generated_by_model: model }).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ card: data, fallback: model === "rule-based", cached: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Call-card generation failed." }, { status: 400 });
  }
}
