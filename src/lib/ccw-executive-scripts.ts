export const SEGMENT_IDS = ["contact_center", "cx", "technology", "digital", "commercial", "operations"] as const;
export type SegmentId = typeof SEGMENT_IDS[number];

export type ScriptContext = {
  firstName: string;
  companyName: string;
  title: string;
  industry: string;
};

type SegmentTemplate = {
  id: SegmentId;
  label: string;
  decisionCurrency: string;
  products: string;
  elevatorPitch: string;
  opening: string;
  value: string;
  turn: string;
  pushbacks: { label: string; response: string }[];
};

const replace = (template: string, context: ScriptContext) => template
  .replaceAll("{{firstName}}", context.firstName)
  .replaceAll("{{companyName}}", context.companyName)
  .replaceAll("{{operation}}", operationFor(context))
  .replaceAll("{{workflow}}", workflowFor(context));

const industry = (context: ScriptContext) => context.industry.toLowerCase();

export function operationFor(context: ScriptContext) {
  const value = industry(context);
  if (/health|medical|hospital|care/.test(value)) return "patient-access and service operation";
  if (/bank|financial|insurance|credit union/.test(value)) return "member and customer-service operation";
  if (/property|real estate|housing/.test(value)) return "resident-service operation";
  if (/utility|energy|government|municipal/.test(value)) return "customer-service and service-dispatch operation";
  if (/retail|commerce|e-commerce|consumer/.test(value)) return "customer-support operation";
  if (/travel|hospitality|airline/.test(value)) return "traveler and guest-service operation";
  return "customer-operation environment";
}

export function workflowFor(context: ScriptContext) {
  const value = industry(context);
  if (/health|medical|hospital|care/.test(value)) return "patient intake, scheduling, or service routing";
  if (/bank|financial|insurance|credit union/.test(value)) return "account servicing, authentication, or payment-related calls";
  if (/property|real estate|housing/.test(value)) return "resident maintenance triage or service requests";
  if (/utility|energy|government|municipal/.test(value)) return "outage, billing, or citizen-service calls";
  if (/retail|commerce|e-commerce|consumer/.test(value)) return "order, return, or delivery-support calls";
  if (/travel|hospitality|airline/.test(value)) return "booking, change, or service-status calls";
  return "a high-volume, repeatable customer interaction";
}

const templates: Record<SegmentId, SegmentTemplate> = {
  contact_center: {
    id: "contact_center",
    label: "Contact Center & Support Operations",
    decisionCurrency: "Queue reduction, cost per interaction, agent capacity, and service continuity.",
    products: "Automate365™ + Assist365™",
    elevatorPitch: "{{firstName}}, Gnani helps teams move repeatable voice journeys out of the live-agent queue while giving agents guidance for the conversations that still need judgment. We own the speech and agent layer together, so the starting point is one practical workflow—not a broad platform replacement.",
    opening: "Hi {{firstName}}, Sharath from Gnani.ai. I’m calling after CCW Las Vegas because we were speaking with contact-center leaders about when predictable phone demand begins taking too much live-agent capacity. I thought {{companyName}}’s {{operation}} might be relevant.",
    value: "The teams we speak with are not short of people working hard; skilled agents are still carrying routine calls while queues, training load, and service pressure rise. Gnani can automate bounded journeys such as {{workflow}}, then use Assist365™ to support an agent when a person needs to stay involved. The difference is that Gnani owns the voice and agent stack together, built for live telephony rather than a stitched-together bot experience.",
    turn: "I’m not asking you to rethink the whole stack on a cold call. I’d like to map one high-volume journey and show how deflection plus live-agent guidance could fit around your existing environment. Would a 10-minute working session on Tuesday or Thursday be better?",
    pushbacks: [
      { label: "We already have a bot", response: "That makes sense. The useful comparison is usually where the current voice experience still hands work back to agents, loses context, or becomes unnatural under real call conditions. We can assess one journey, not replace everything." },
      { label: "Not a priority", response: "Understood. When it does become relevant, the cleanest starting point is normally the call type consuming skilled-agent time without needing skilled-agent judgment." }
    ]
  },
  cx: {
    id: "cx",
    label: "Customer Experience & Customer Success",
    decisionCurrency: "CSAT/NPS protection, consistency, quality visibility, and customer effort.",
    products: "Aura365™ + Assist365™",
    elevatorPitch: "{{firstName}}, Gnani helps customer-experience teams remove avoidable wait time, guide agents in the moments that need a person, and see quality patterns across conversations—not just a small manual sample. The goal is a more consistent customer experience, not automation for its own sake.",
    opening: "Hi {{firstName}}, Sharath from Gnani.ai. I’m reaching out after CCW Las Vegas because CX leaders kept returning to one issue: protecting the experience when call volumes rise, not simply cutting cost. Given {{companyName}}’s {{operation}}, I thought it was worth a direct call.",
    value: "Most CX teams face two related gaps: routine callers wait too long for a resolution, and quality teams can only manually review a fraction of the conversations shaping satisfaction. Gnani can automate predictable interactions and use Aura365™ to surface sentiment, compliance, intent, and quality patterns across the conversation base. Assist365™ can guide agents live where consistency, empathy, or recovery matters most.",
    turn: "The right question is not whether to automate every call. It is where the customer is waiting unnecessarily or getting an inconsistent answer today. Would you be open to a 10-minute discussion around one {{workflow}} journey at {{companyName}}?",
    pushbacks: [
      { label: "AI could hurt CX", response: "That is the right concern. The standard should be a natural, fast resolution or a clean handoff with context—not whether the interaction is technically automated." },
      { label: "We already have QA", response: "Most teams do. The question is whether sampling exposes the real patterns behind repeat contacts, complaints, and coaching needs. Aura365™ is intended to expand visibility, not replace your team’s judgment." }
    ]
  },
  technology: {
    id: "technology",
    label: "IT, Telephony & Contact-Center Technology",
    decisionCurrency: "Latency, architecture, integration burden, security, and stack control.",
    products: "Native Voice AI stack + Armour365™",
    elevatorPitch: "{{firstName}}, Gnani gives technology teams a native voice-and-agent stack for real telephony, rather than another collection of speech APIs and orchestration layers to integrate and govern. The discussion is about latency, data control, and one contained workflow—not a generic AI demo.",
    opening: "Hi {{firstName}}, Sharath from Gnani.ai. I’m calling after CCW Las Vegas regarding {{companyName}}’s voice and telephony architecture. We were speaking with IT leaders who are being asked to support Voice AI without adding another stitched vendor stack, security review, and latency problem to the environment.",
    value: "Gnani owns the underlying speech and agent layers together: speech-to-speech, recognition, synthesis, reasoning, and voice-agent workflows. That gives teams a path to lower latency, fewer third-party dependencies, and tighter control over voice data. Gnani’s public platform positioning is under-200ms P95 latency and deep training on real telephonic audio; where authentication is relevant, Armour365™ adds a voice-biometrics and anti-spoofing discussion.",
    turn: "I would not give you a generic platform demo. I’d rather map your current telephony, CRM, identity, and workflow layers, then decide whether one {{workflow}} use case is worth evaluating. Would a 10-minute architecture review next week be useful?",
    pushbacks: [
      { label: "We already use a vendor", response: "Then the practical comparison is latency, vendor boundaries, action orchestration, data handling, and how much integration work sits with your team. If those answers are already strong, we will know quickly." },
      { label: "Send documentation", response: "Absolutely. I can send the architecture overview; a short technical review is still useful if you want to assess the fit against your actual environment rather than a generic capability list." }
    ]
  },
  digital: {
    id: "digital",
    label: "Digital Transformation & AI Leaders",
    decisionCurrency: "Production automation, measurable ROI, and execution beyond pilots.",
    products: "Automate365™ + native Voice AI stack",
    elevatorPitch: "{{firstName}}, Gnani is built for the gap between chatbot pilots and production phone automation: a voice agent that can hold a real conversation and complete a defined workflow. We would start with one measurable {{workflow}} journey, not an abstract AI programme.",
    opening: "Hi {{firstName}}, Sharath from Gnani.ai. I’m calling after CCW Las Vegas because a pattern came up repeatedly with digital leaders: chat automation is everywhere, but the phone channel still sits outside most AI programmes. I wanted to see whether voice is part of the roadmap at {{companyName}}.",
    value: "Gnani draws a line between a voice layer that merely talks and an agentic system that completes work. The platform can support multi-turn phone interactions around a defined workflow—such as {{workflow}}—and connect into approved systems for actions and handoffs. Because the speech and orchestration layers are native, the conversation is built for production telephony rather than a polished chatbot experiment.",
    turn: "If {{companyName}} has one phone-heavy, rules-driven journey that has not moved beyond a pilot, I would be interested in pressure-testing it with you. Would a 10-minute working session next Tuesday make sense?",
    pushbacks: [
      { label: "We are already piloting GenAI", response: "That is often the right starting point. The test is whether the pilot survives live callers, interruptions, accents, handoffs, governance, and actual system actions—not whether it looks good in a demo." },
      { label: "We do chat first", response: "That is sensible. The opportunity is where callers still choose the phone because the journey is urgent, complex, or needs an action completed in the moment." }
    ]
  },
  commercial: {
    id: "commercial",
    label: "Sales, Revenue & Commercial Growth",
    decisionCurrency: "Speed-to-lead, coverage, conversion, and pipeline efficiency.",
    products: "Automate365™ outbound voice agents and callback workflows",
    elevatorPitch: "{{firstName}}, Gnani helps commercial teams ensure an interested buyer does not disappear because the first response came too late. Our voice workflows can respond immediately, qualify a defined inquiry, and route the right opportunity to a salesperson—without asking strategic sellers to spend time on every basic interaction.",
    opening: "Hi {{firstName}}, Sharath from Gnani.ai. I’m calling after CCW Las Vegas because commercial leaders kept raising the same issue: good inbound demand is often lost before a salesperson reaches the buyer. I wanted to see whether speed-to-lead or after-hours coverage is a live topic at {{companyName}}.",
    value: "Gnani gives commercial teams an automated voice layer that can respond immediately, work through an approved qualification flow, answer basic questions, gather the necessary information, and route a sales-ready opportunity into the team. The point is not to replace strategic sellers; it is to prevent lead decay and give your team capacity for the conversations where judgment creates value.",
    turn: "I’d like to understand one inbound path at {{companyName}}—a web lead, campaign response, application, dealer inquiry, or service-to-sales handoff—and show what an immediate callback could look like. Would a 10-minute review next Wednesday or Thursday be worthwhile?",
    pushbacks: [
      { label: "Our SDRs do that", response: "They should own the conversations where a seller adds judgment. The question is whether they are also spending time on instant response, basic qualification, repeat follow-up, and after-hours coverage." },
      { label: "We do not have enough volume", response: "Then it may not be the right first use case. We can look instead at one high-value, time-sensitive segment where a delayed response is especially costly." }
    ]
  },
  operations: {
    id: "operations",
    label: "Executive Operations & Business Leaders",
    decisionCurrency: "Operating leverage, margin protection, resilience, and scalable service capacity.",
    products: "Automate365™ + Assist365™ + Aura365™",
    elevatorPitch: "{{firstName}}, Gnani helps operations teams separate the calls that need human judgment from the calls that need a fast, reliable resolution. We can automate a bounded voice journey, support live teams where judgment matters, and show the operating patterns behind the demand—starting with one measurable workflow.",
    opening: "Hi {{firstName}}, Sharath from Gnani.ai. I’m calling after CCW Las Vegas because operations leaders were focused on a straightforward issue: service demand keeps growing, but adding people to absorb every call is not a scalable operating model. Given {{companyName}}’s {{operation}}, I thought the capacity question may be relevant.",
    value: "Gnani helps enterprises separate work that requires people from work that requires a fast, reliable response. Routine voice journeys can be automated; live teams can receive in-call guidance when judgment is still needed; and operations can see quality and demand patterns across conversations. The business case is not an AI experiment—it is protecting service levels and operating margin while demand changes.",
    turn: "I would not assume the right workflow for {{companyName}}. If you are open to it, we can map one {{workflow}} journey and look at the levers: deflection, agent efficiency, quality visibility, and scalable coverage. Would a 10-minute executive working session next Thursday be useful?",
    pushbacks: [
      { label: "We do not run a call center", response: "Understood. This is relevant only where phone-based customer or operational demand is material. It may sit in service, branches, dispatch, support, or an outsourced operation rather than a formal call center." },
      { label: "This sounds like cost cutting", response: "Cost matters, but it is not the whole case. The operational standard is whether customers get a faster answer and whether the organisation can absorb demand spikes without degrading service." }
    ]
  }
};

export function classifySegment(title?: string | null, persona?: string | null): SegmentId {
  const value = `${title || ""} ${persona || ""}`.toLowerCase();
  if (/customer experience|customer success|\bcx\b|\bcsat\b|\bnps\b/.test(value)) return "cx";
  if (/contact center|call center|customer service|customer support|service center|support operations/.test(value)) return "contact_center";
  if (/chief information|\bcio\b|\bcto\b|information technology|telecom|telephony|it director|technology/.test(value)) return "technology";
  if (/digital transformation|artificial intelligence|\bai\b|automation|digital product/.test(value)) return "digital";
  if (/sales|revenue|commercial|business development|growth|demand generation/.test(value)) return "commercial";
  return "operations";
}

export function getSegment(id: SegmentId) { return templates[id]; }

export function buildScript(id: SegmentId, context: ScriptContext) {
  const segment = templates[id];
  return {
    ...segment,
    elevatorPitch: replace(segment.elevatorPitch, context),
    opening: replace(segment.opening, context),
    value: replace(segment.value, context),
    turn: replace(segment.turn, context),
    pushbacks: segment.pushbacks.map((item) => ({ ...item, response: replace(item.response, context) }))
  };
}
