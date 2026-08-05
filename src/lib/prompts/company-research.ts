export const companyResearchPrompt = (context: Record<string, unknown>) => `Create a factual, concise company brief from the supplied public website evidence.

This is a company-research task, not a sales pitch. Do not mention Gnani, recommend products, or infer a need for AI. Do not make claims that are not present in the evidence. If a field is not supported, return "Not established from the reviewed sources." Keep each value to one or two sentences.

Return valid JSON with exactly these keys:
{
  "company_overview": "",
  "products_and_services": "",
  "customer_segments": "",
  "operating_footprint": "",
  "customer_operations_context": "",
  "noteworthy_context": "",
  "source_confidence": "high|medium|low",
  "confidence": 0
}

Evidence: ${JSON.stringify(context)}`;
