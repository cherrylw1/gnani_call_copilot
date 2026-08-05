export const CALL_CARD_RECIPE_VERSION = "2026-08-05.1";

export type ElevatorPitches = {
  detailed: string;
  medium: string;
  quick: string;
};

const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

const isValidPitch = (value: unknown, min: number, max: number, sentences?: number) => {
  if (typeof value !== "string" || !value.trim()) return false;
  if (wordCount(value) < min || wordCount(value) > max) return false;
  if (sentences && (value.match(/[.!?](?:\s|$)/g) ?? []).length !== sentences) return false;
  return true;
};

export function isCurrentElevatorPitches(value: unknown): value is ElevatorPitches {
  if (!value || typeof value !== "object") return false;
  const pitches = value as Record<string, unknown>;
  return isValidPitch(pitches.detailed, 65, 90)
    && isValidPitch(pitches.medium, 42, 60)
    && isValidPitch(pitches.quick, 28, 36, 1);
}

export function createFallbackElevatorPitches({ firstName, companyName, role }: { firstName?: string | null; companyName?: string | null; role?: string | null }): ElevatorPitches {
  const person = firstName || "there";
  const company = companyName || "your team";
  const roleContext = role ? ` in your ${role} role` : "";

  return {
    detailed: `${person}, we know ${company} needs to keep customer operations moving across high-volume interactions${roleContext}. Gnani works alongside the systems you already use, combining voice automation where a workflow is repeatable with real-time agent guidance, interaction analytics, and post-call summaries where a person needs to stay involved. The practical starting point is one confirmed journey, so your team can see what changes for agent effort, customer experience, and operating visibility before expanding further.`,
    medium: `${person}, we are not asking ${company} to replace its core stack. Gnani adds voice automation, live agent guidance, interaction analytics, and post-call summaries around the customer journeys that are repetitive, difficult to monitor, or still need a person—starting with one confirmed workflow and proving value there.`,
    quick: `${person}, Gnani works alongside your existing stack to automate repeatable customer conversations, guide agents in the live moments that need a person, and show you what is happening across those interactions in the workflow.`
  };
}
