const buyerTerms = ["bpo", "outsourcing", "healthcare", "bfsi", "fintech", "financial", "customer support", "contact center", "enterprise", "insurance", "collections", "telecom", "retail", "e-commerce", "travel", "hospitality", "utilities"];
const partnerTerms = ["cx technology", "ai vendor", "contact center vendor", "voice ai", "conversational ai", "ccaas", "crm", "speech analytics", "bot platform"];
export type LeadCategory = "Strong buyer fit" | "Possible buyer fit" | "Partner / ecosystem fit" | "Competitor / adjacent vendor" | "Low relevance" | "Needs review";
export function classifyLead(industry: string, companyName: string, needsReview = false): LeadCategory {
  if (needsReview) return "Needs review";
  const text = `${industry} ${companyName}`.toLowerCase();
  if (partnerTerms.some((term) => text.includes(term))) return text.includes("vendor") || text.includes("voice ai") ? "Competitor / adjacent vendor" : "Partner / ecosystem fit";
  if (buyerTerms.some((term) => text.includes(term))) return "Strong buyer fit";
  return industry ? "Possible buyer fit" : "Low relevance";
}
