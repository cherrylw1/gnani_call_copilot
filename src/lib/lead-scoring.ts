import { classifyLead } from "./lead-classification";

const signal = (value: string) => /yes|high|invest|match|true/i.test(value) ? 8 : 0;
export function calculateFitScore(input: { priority?: number | null; industry?: string; persona?: string; voice?: string; chatbot?: string; ivr?: string; callVolume?: string; budget?: string; previousOutreach?: string; company?: string }) {
  const category = classifyLead(input.industry ?? "", input.company ?? "");
  let score = Math.min(45, Math.max(0, input.priority ?? 0) * 0.45);
  if (/operations|customer service|customer experience|executive|product|technology|sales|revenue|support/i.test(input.persona ?? "")) score += 14;
  if (category === "Strong buyer fit") score += 18;
  if (category === "Possible buyer fit") score += 8;
  if (category === "Partner / ecosystem fit") score += 4;
  if (category === "Competitor / adjacent vendor") score -= 10;
  score += signal(input.voice ?? "") + signal(input.chatbot ?? "") + signal(input.ivr ?? "");
  if (/100k|500k|high/i.test(input.callVolume ?? "")) score += 8;
  if (/jul|year end|match/i.test(input.budget ?? "")) score += 5;
  if (input.previousOutreach) score += 2;
  return Math.max(0, Math.min(100, Math.round(score)));
}
