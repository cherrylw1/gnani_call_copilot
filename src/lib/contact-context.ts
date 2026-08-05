import { CALL_CARD_RECIPE_VERSION, isCurrentAccountBrief, isCurrentElevatorPitches } from "./call-card-recipe";
import { createAdminSupabaseClient } from "./supabase/admin";

export async function getContactContext(email: string) {
  const admin = createAdminSupabaseClient();
  const { data: contact, error } = await admin.from("contacts").select("*").eq("email", email.trim().toLowerCase()).maybeSingle();
  if (error) throw new Error(error.message);
  if (!contact) return null;

  const [companyResult, signalsResult, cardResult, activityResult] = await Promise.all([
    contact.company_id ? admin.from("companies").select("*").eq("id", contact.company_id).maybeSingle() : Promise.resolve({ data: null }),
    admin.from("lead_signals").select("*").eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("lead_intelligence_cards").select("*").eq("contact_id", contact.id).order("generated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("call_activities").select("*").eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(5)
  ]);

  const savedCard = cardResult.data;
  const objectionHandles = savedCard?.objection_handles;
  const isCurrentCard = Boolean(
    objectionHandles
    && typeof objectionHandles === "object"
    && "not_a_priority" in objectionHandles
    && savedCard?.brief_recipe_version === CALL_CARD_RECIPE_VERSION
    && isCurrentElevatorPitches(savedCard.elevator_pitches)
    && isCurrentAccountBrief(savedCard.account_brief)
  );
  return { contact, company: companyResult.data, signals: signalsResult.data, card: isCurrentCard ? savedCard : null, activities: activityResult.data ?? [] };
}
