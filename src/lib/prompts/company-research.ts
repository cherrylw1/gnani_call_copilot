export const companyResearchPrompt = (context: Record<string, unknown>) => `Create a factual, practical company profile from the supplied public website evidence.

This is a company-research task, not a sales pitch. Do not mention Gnani, recommend products, or infer a need for AI. Do not make claims that are not present in the evidence. If a field is not supported, return "Not established from the reviewed sources." Keep each value to one or two sentences.

Quality rules:
- company_overview must explain what the company is, who it serves, its core services, and its geography in 55-90 words when the sources support it.
- products_and_services must name the material services or products, not merely restate the industry.
- operating_footprint must preserve any specific locations, facilities, employee/provider counts, or scale facts present in the sources.
- customer_operations_context must describe only confirmed customer, patient, member, or service interaction channels and journeys from the evidence. Do not assume a contact center or a problem if not supported.
- noteworthy_context should capture the most useful verified scale or strategic fact for an account researcher.

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
