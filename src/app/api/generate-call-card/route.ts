import { NextResponse } from "next/server";
import { z } from "zod";
import { CALL_CARD_RECIPE_VERSION, createFallbackElevatorPitches, isCurrentElevatorPitches } from "@/lib/call-card-recipe";
import { getContactContext } from "@/lib/contact-context";
import { openRouterJson } from "@/lib/openrouter";
import { callCardPrompt } from "@/lib/prompts/call-card";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const researchValue = (research: unknown, key: string) => {
  if (!research || typeof research !== "object") return "";
  const value = (research as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

const fallback = (context: NonNullable<Awaited<ReturnType<typeof getContactContext>>>) => {
  const company = context.company;
  const research = company?.research_data;
  const role = context.contact.job_title || context.contact.persona || "customer-operations leader";
  const companyOverview = researchValue(research, "company_overview") || (company?.industry_auto_classified ? `${company.company_name} is classified in the CSV as ${company.industry_auto_classified}.` : "No verified company brief is available yet.");
  const operationsContext = researchValue(research, "customer_operations_context");
  const roleContext = `${context.contact.first_name || "there"}${role ? `, given your ${role} role` : ""}`;

  return {
    lead_category: company?.buyer_partner_competitor_status ?? "Needs review",
    fit_score: Number(company?.fit_score ?? 0),
    company_summary: companyOverview,
    why_this_company: operationsContext || `The CSV identifies ${context.contact.full_name || "this contact"} as ${role} at ${company?.company_name || "this company"}. The account should be qualified further before making specific claims.`,
    best_gnani_angle: "Lead with a short, relevant conversation about voice AI, agent assist, and visibility across customer interactions; tailor the use case only after they confirm their priorities.",
    recommended_products: ["AI Voice Agents", "Agent Assist", "Conversation Intelligence"],
    cold_call_opener: `Hi ${roleContext}, this is Sharath from gnani.ai. We help customer-facing teams make high-volume voice interactions easier to handle with voice AI and agent assist. Would it be useful to briefly compare where automation or agent support could help at ${company?.company_name || "your team"}?`,
    personalized_pitch: `For ${company?.company_name || "your organization"}, Gnani could be relevant where customer conversations are repetitive, time-sensitive, or hard to monitor at scale. We can automate appropriate voice interactions, assist agents during calls, and surface quality insights—starting with one confirmed workflow rather than a broad transformation claim.`,
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
    source_confidence: researchValue(research, "source_confidence") || "CSV-backed; company details require refreshed public-web research."
  };
};

export async function POST(request: Request) {
  try {
    const { email, refresh } = z.object({ email: z.string().email(), refresh: z.boolean().optional() }).parse(await request.json());
    const context = await getContactContext(email);
    if (!context) return NextResponse.json({ error: "No contact found for this email." }, { status: 404 });

    if (!refresh && context.card?.brief_recipe_version === CALL_CARD_RECIPE_VERSION && isCurrentElevatorPitches(context.card.elevator_pitches)) {
      return NextResponse.json({ card: context.card, fallback: context.card.generated_by_model === "rule-based", cached: true });
    }

    const baseCard = fallback(context);
    let card = baseCard;
    let model = "rule-based";
    try {
      const result = await openRouterJson<typeof card>(callCardPrompt(context), 1000);
      const generated = result.data;
      card = {
        ...baseCard,
        ...generated,
        elevator_pitches: isCurrentElevatorPitches(generated.elevator_pitches) ? generated.elevator_pitches : baseCard.elevator_pitches,
        discovery_questions: [],
        recommended_products: Array.isArray(generated.recommended_products) ? generated.recommended_products : baseCard.recommended_products,
        objection_handles: {
          ...baseCard.objection_handles,
          ...(generated.objection_handles && typeof generated.objection_handles === "object" ? generated.objection_handles : {})
        }
      };
      model = result.model;
    } catch {
      // A validated fallback lets the caller proceed even if a model is unavailable.
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("lead_intelligence_cards")
      .insert({
        contact_id: context.contact.id,
        company_id: context.company?.id ?? null,
        ...card,
        recommended_products: card.recommended_products,
        discovery_questions: [],
        objection_handles: card.objection_handles,
        brief_recipe_version: CALL_CARD_RECIPE_VERSION,
        generated_by_model: model
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ card: data, fallback: model === "rule-based", cached: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Call-card generation failed." }, { status: 400 });
  }
}
