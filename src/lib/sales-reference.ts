export const salesReference = {
  positioning: {
    headline: "A voice-first customer-operations layer - not another generic chatbot",
    summary: "Gnani helps customer-operations teams automate the repeatable parts of customer conversations, make live agents more effective in the moments that need a person, and understand what is happening across interactions.",
    pillars: [
      { title: "Automate bounded journeys", detail: "Voice agents for defined inbound or outbound workflows: qualification, reminders, status requests, collections, onboarding, and service tasks - with handoff when the workflow needs a person." },
      { title: "Make agents stronger in the moment", detail: "Assist can surface context, knowledge, next steps, compliance prompts, summaries, and coaching signals during or immediately after a conversation." },
      { title: "Turn conversations into operating data", detail: "Analytics and QA can examine topics, sentiment, compliance, repeat-contact drivers, and agent patterns across the interaction base instead of a small manual sample." },
      { title: "Add identity where it matters", detail: "Voice biometrics is relevant when authentication friction or fraud exposure is part of the customer journey." }
    ]
  },
  dropIns: [
    "We do not start by asking you to replace the contact-center stack; we start with one workflow where automation, live guidance, or visibility is missing.",
    "The useful boundary is not human versus AI. It is which part of the journey is repeatable, and where a person needs better context to resolve the exception.",
    "A voice agent can own a bounded task, but the handoff matters just as much: the agent should receive the conversation context and the next relevant action.",
    "Agent Assist is for the live call: guidance, knowledge, workflow steps, and coaching when the outcome depends on the human conversation.",
    "Conversation Analytics is for the operating view: what is driving contact volume, repeat calls, compliance risk, sentiment shifts, and coaching needs.",
    "For a regulated team, the value is not only automation; it is a more consistent, auditable customer interaction at scale.",
    "The right first use case is narrow enough to measure and meaningful enough to prove whether the platform belongs in the wider customer-operations roadmap.",
    "Gnani is strongest when voice, agent experience, analytics, and enterprise workflow integration need to work together rather than as separate point tools."
  ],
  proofPoints: [
    { label: "U.S. customer references", value: "Maximus (healthcare, Agent Assist) and Horsepower are the approved U.S. references in this workspace. Confirm current naming permission and the relevant account scope before mentioning either externally.", scope: "Internal sales guidance" },
    { label: "Comparable U.S. Assist proof", value: "An analogous U.S. automotive-finance Assist deployment reported 24% higher agent efficiency. Use it as comparable proof only - never as an outcome for the prospect you are calling.", scope: "Approved internal case-study claim" },
    { label: "Comparable U.S. Analytics proof", value: "An internal U.S. automotive analytics case reported 6x faster churn prediction after applying conversation analytics. Keep the industry and outcome scope attached to the claim.", scope: "Approved internal case-study claim" },
    { label: "Global credibility", value: "Internal materials describe deployment across 200+ enterprises and support across voice, chat, SMS, messaging, analytics, and biometrics. Confirm the approved external collateral before using footprint or deployment figures in a customer-facing follow-up.", scope: "Internal platform material" },
    { label: "APAC references", value: "Internal FAQ material lists ICICI Lombard, SBI Life, Bank of Baroda, Concentrix, Tata Motors, and Mahindra Group as public references. Use only current, approved customer names and the relevant product scope.", scope: "Internal FAQ material" }
  ],
  useCaseMap: [
    { trigger: "High inbound volume or repetitive requests", products: "Voice AI Agents", outcome: "Bound a repeatable workflow, collect the right information, complete the task or hand off with context." },
    { trigger: "Long or inconsistent human-handled calls", products: "Agent Assist", outcome: "Give agents real-time guidance, knowledge, workflow steps, compliance prompts, and post-call summaries." },
    { trigger: "Manual QA or weak visibility into conversations", products: "Conversation Analytics", outcome: "Find topics, sentiment, compliance, repeat-contact patterns, and coaching opportunities at scale." },
    { trigger: "Authentication friction or fraud risk", products: "Voice Biometrics", outcome: "Introduce voice-based authentication and anti-spoofing into the relevant customer journey." }
  ],
  competitors: [
    {
      name: "PolyAI",
      publicPositioning: "Enterprise voice AI agents for customer-service conversations, with industry use cases such as authentication, routing, payments, bookings, and account servicing.",
      gnaniAngle: "Do not make it a realism contest. Position Gnani where the buyer needs a voice-first platform plus live agent guidance, conversation analytics, workflow automation, and biometrics across the wider operation.",
      fieldMove: "Ask which journeys need a fully automated voice agent and which still need human agents with context and operational visibility.",
      sourceUrl: "https://poly.ai/"
    },
    {
      name: "Kore.ai",
      publicPositioning: "An enterprise agent platform spanning service AI agents, agent assistance, contact-center quality assurance, proactive outreach, and broader enterprise AI use cases.",
      gnaniAngle: "Keep the conversation on the operating problem, especially telephony-grade customer workflows. Differentiate through a voice-led, full-stack customer-operations conversation rather than claiming a blanket platform advantage.",
      fieldMove: "Clarify whether the immediate need is general enterprise agents or a customer-interaction workflow that needs voice, agent support, and QA together.",
      sourceUrl: "https://kore.ai/"
    },
    {
      name: "Cognigy",
      publicPositioning: "Enterprise customer-service AI agents across voice, chat, messaging, contact-center AI, agent assist, orchestration, and integrations.",
      gnaniAngle: "Lead with a measurable customer-operations workflow and Gnani's voice, Assist, Analytics, and biometrics portfolio. Do not suggest the buyer should rip out an existing conversational-AI platform without a confirmed gap.",
      fieldMove: "Determine whether the buyer needs a new automated channel, better human-agent performance, or interaction intelligence after the conversation.",
      sourceUrl: "https://www.cognigy.com/"
    },
    {
      name: "Cresta",
      publicPositioning: "Customer-experience AI covering AI agents, real-time Agent Assist, knowledge, summaries, behavioral guidance, conversation intelligence, coaching, quality assurance, and training.",
      gnaniAngle: "This is often an Agent Assist and conversation-intelligence comparison. Frame Gnani around real-time voice workflows, enterprise integration, and the ability to pair Assist and Analytics with automation and biometrics where the account needs it.",
      fieldMove: "Anchor the conversation in a live-call workflow, not a generic AI roadmap; ask what agents need in the moment and what leaders cannot see today.",
      sourceUrl: "https://cresta.com/"
    },
    {
      name: "Observe.AI",
      publicPositioning: "A CX AI platform offering customer-support agents, frontline assistance, interaction intelligence, workflow integrations, governance, testing, and release controls.",
      gnaniAngle: "Treat this as an interaction-intelligence and frontline-operations comparison. Position Gnani where voice automation, Assist, Analytics, and enterprise customer workflows need to be considered as one operating layer.",
      fieldMove: "Separate the need for after-call intelligence from the need to automate or assist the conversation itself; the answer may require more than analytics alone.",
      sourceUrl: "https://www.observe.ai/"
    },
    {
      name: "CallMiner",
      publicPositioning: "Conversation intelligence and automation software focused on contact-center experience, quality assurance, frontline performance, compliance, fraud detection, sales effectiveness, and customer-experience analytics.",
      gnaniAngle: "CallMiner is most relevant when the account starts with analytics, QA, or compliance. Position Gnani as a path from insight to action: analyze the interaction, guide the agent, and automate bounded voice workflows where appropriate.",
      fieldMove: "Ask whether the buyer only needs to understand calls better or also needs to change what happens during and after the call.",
      sourceUrl: "https://callminer.com/"
    }
  ],
  guardrails: [
    "Never present an internal benchmark, comparable case study, or another customer's result as the prospect's expected outcome.",
    "Never imply a customer relationship, product deployment, named integration, or current initiative without approved evidence for that account.",
    "Use a competitor to clarify the buyer's problem and evaluation criteria - not to make unverified product, pricing, security, or performance claims.",
    "For a named reference, confirm current permission, product scope, geography, and whether the conversation is covered by an NDA before using it externally."
  ]
} as const;
