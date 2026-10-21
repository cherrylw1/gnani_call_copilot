"use client";

import { useState, useMemo } from "react";
import {
  Layers,
  Phone,
  Mail,
  Linkedin,
  Swords,
  Calendar,
  Copy,
  Check,
  Building2,
  ArrowRight,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  Search,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type ActiveTab = "overview" | "ccw" | "outbound" | "displacement";
type CcwTier = "tier1_2" | "tier3" | "tier4";

export interface CcwIndustrySector {
  id: string;
  name: string;
  category: "buyer" | "partner" | "other";
  count: number;
  pct: number;
  companiesCount: number;
  subIndustries: string[];
  sampleCompanies: string[];
  primaryPersonas: string;
  voiceAiHook: string;
  typicalPains: string;
}

export interface CcwPersona {
  name: string;
  count: number;
  pct: number;
  color: string;
  desc: string;
}

const ccwPersonaData: CcwPersona[] = [
  {
    name: "Operations & Customer Support",
    count: 685,
    pct: 40.9,
    color: "bg-blue-500",
    desc: "Contact center directors, support VPs, call center managers, customer care leads"
  },
  {
    name: "Executive Leadership & COOs",
    count: 454,
    pct: 27.1,
    color: "bg-amber-500",
    desc: "Chief Operating Officers, SVPs, CXOs, Managing Directors, General Managers"
  },
  {
    name: "Product, IT & Telephony",
    count: 169,
    pct: 10.1,
    color: "bg-indigo-500",
    desc: "Telephony analysts, CCaaS engineers, IT directors, CIOs, network operations"
  },
  {
    name: "Customer Experience (CX) & Success",
    count: 137,
    pct: 8.2,
    color: "bg-emerald-500",
    desc: "Chief Experience Officers, CX Directors, Client Success VPs, customer advocacy"
  },
  {
    name: "Sales & Commercial Growth",
    count: 134,
    pct: 8.0,
    color: "bg-violet-500",
    desc: "Commercial leaders, sales directors, GTM executives, account executives"
  },
  {
    name: "HR, Enablement & QA",
    count: 48,
    pct: 2.9,
    color: "bg-zinc-500",
    desc: "Quality assurance leads, workforce trainers, supervisors, customer service QA"
  }
];

const ccwIndustryData: CcwIndustrySector[] = [
  {
    id: "support-intensive",
    name: "Customer Support Intensive (Cross-Industry)",
    category: "buyer",
    count: 289,
    pct: 17.3,
    companiesCount: 141,
    subIndustries: ["Customer Support Intensive (289)"],
    sampleCompanies: ["Aflac", "ADT", "AAFES", "ADCS Clinics", "Accuserve Solutions", "1-800 Contacts"],
    primaryPersonas: "Operations & Support (67%), Executive Leadership (20%)",
    voiceAiHook:
      "Autonomous tier-1 inbound call resolution, eliminating hold times and queue abandons during daily volume spikes.",
    typicalPains:
      "High cost-per-call ($6.50+), long queue wait times driving call abandons, and 35%+ agent annual turnover."
  },
  {
    id: "cx-tech",
    name: "CX Tech, AI & Contact Center Vendors",
    category: "partner",
    count: 238,
    pct: 14.2,
    companiesCount: 135,
    subIndustries: [
      "CX Technology/AI Vendor (95)",
      "Contact Center / CCaaS (69)",
      "CX Platforms (26)",
      "Speech Analytics (11)"
    ],
    sampleCompanies: ["[24]7.ai", "8x8", "ASAPP", "Afiniti", "Agora", "Alvaria", "Amazon Connect", "Five9"],
    primaryPersonas: "Sales & Revenue (31%), Executive Leadership (26%), Product/IT (17%)",
    voiceAiHook:
      "Partnering & telephony co-existence: sub-200ms sovereign voice engine API directly over SIP vs CCaaS replacement.",
    typicalPains:
      "Audio latency in multi-vendor rented stacks (1.5s - 2.5s lag) and high per-minute rented model costs."
  },
  {
    id: "business-services",
    name: "Business, Professional & Facilities Services",
    category: "buyer",
    count: 231,
    pct: 13.8,
    companiesCount: 151,
    subIndustries: [
      "Business Services (200)",
      "Professional Services/Consulting (17)",
      "Facilities & Property (6)",
      "IT Consulting (3)"
    ],
    sampleCompanies: ["Airbnb", "Ainsworth Inc", "Accenture", "CBRE", "Allegis Group", "Akralos"],
    primaryPersonas: "Operations & Customer Support (49%), Executive Leadership (25%)",
    voiceAiHook:
      "Multi-site workforce dispatch, facility maintenance intake, and resident self-touring access over the phone.",
    typicalPains:
      "Decentralized dispatch scheduling and after-hours call routing overload across distributed offices."
  },
  {
    id: "bfsi",
    name: "BFSI, Banking & FinTech",
    category: "buyer",
    count: 219,
    pct: 13.1,
    companiesCount: 151,
    subIndustries: [
      "Core BFSI (131)",
      "FinTech / Payments (27)",
      "Banking & Credit Unions (12)",
      "Insurance & Collections (19)"
    ],
    sampleCompanies: [
      "4Front Credit Union",
      "AAA Auto Club Group",
      "Ally Financial",
      "Airwallex",
      "Albert",
      "Barclays",
      "MIT FCU",
      "UMB Bank"
    ],
    primaryPersonas: "Operations & Support (53%), Executive Leadership (15%), Product/IT (12%)",
    voiceAiHook:
      "Automated balance checks, debit card activation/locks, payoff inquiries, and PCI-compliant phone payments with voice biometrics.",
    typicalPains:
      "Strict PCI/GLBA compliance overhead, peak billing cycle queue spikes, and multi-quarter telephony backlog."
  },
  {
    id: "healthcare",
    name: "Healthcare, Hospital Systems & Life Sciences",
    category: "buyer",
    count: 123,
    pct: 7.3,
    companiesCount: 69,
    subIndustries: [
      "Healthcare Operations (44)",
      "Healthcare & Life Sciences (29)",
      "Medical & Devices (23)",
      "Health Tech (9)"
    ],
    sampleCompanies: [
      "24 Hour Home Care",
      "AdventHealth",
      "Aeroflow Health",
      "Affordable Care",
      "Allina Health",
      "Signify Health",
      "Kaiser Permanente"
    ],
    primaryPersonas: "Operations & Support (50%), Executive Leadership (12%), CX & Success (9%)",
    voiceAiHook:
      "HIPAA-compliant 24/7 patient intake, appointment scheduling, prescription refills, and doctor prior-authorization hold inquiries.",
    typicalPains:
      "High morning patient call spikes, complex EHR scheduling workflows, and licensed clinical staff bogged down in routine status checks."
  },
  {
    id: "consumer-services",
    name: "Consumer Operations & Enterprise Services",
    category: "buyer",
    count: 121,
    pct: 7.2,
    companiesCount: 100,
    subIndustries: [
      "Enterprise & Consumer Operations (81)",
      "Consumer Services (39)",
      "Consumer Products (1)"
    ],
    sampleCompanies: ["AT&T", "AmaWaterways Cruises", "ArenaCX", "Armstrong Collective", "Rent-A-Center"],
    primaryPersonas: "Operations & Support (40%), Executive Leadership (39%), Commercial (13%)",
    voiceAiHook:
      "Subscription modifications, account verification, billing inquiry resolution, and omni-channel customer triage.",
    typicalPains:
      "High customer churn during billing disputes and slow agent onboarding cycles during promotions."
  },
  {
    id: "bpo",
    name: "BPO & Contact Center Outsourcing",
    category: "buyer",
    count: 102,
    pct: 6.1,
    companiesCount: 57,
    subIndustries: [
      "BPO / Outsourcing (84)",
      "Contact Center BPO (11)",
      "Collections & Staffing BPO (4)"
    ],
    sampleCompanies: [
      "Aureon Contact Center Solutions",
      "AZPIRED",
      "CCI Global",
      "EBG Solutions",
      "Sutherland",
      "TTEC",
      "Teleperformance"
    ],
    primaryPersonas: "Operations & Customer Support (58%), Executive Leadership (22%), Sales (11%)",
    voiceAiHook:
      "Deflecting tier-1 voice queues (reducing cost-per-call from $6.50 to $0.80) and empowering live reps with Real-Time Agent Co-Pilot.",
    typicalPains:
      "Contract margin compression, high agent attrition (40%+), and meeting strict client SLA penalty thresholds."
  },
  {
    id: "telecom-media",
    name: "Telecom, Media & Entertainment",
    category: "buyer",
    count: 70,
    pct: 4.2,
    companiesCount: 42,
    subIndustries: [
      "Media & Entertainment (20)",
      "Telecom Providers (18)",
      "Tech & Telecom (12)",
      "Publishing & Events (6)"
    ],
    sampleCompanies: ["Altice", "Brightspeed", "Caesars Entertainment", "Charter Spectrum", "Customer Experience Dive"],
    primaryPersonas: "Operations & Support (46%), Executive Leadership (21%), Product/IT (14%)",
    voiceAiHook:
      "Automated billing inquiries, service package upgrades, technician dispatch updates, and churn prevention.",
    typicalPains:
      "Repeated bill shock calls after promotional expiration and technical dispatch scheduling."
  },
  {
    id: "tech-saas",
    name: "Enterprise Technology & SaaS",
    category: "buyer",
    count: 69,
    pct: 4.1,
    companiesCount: 52,
    subIndustries: [
      "Tech & Software (14)",
      "IT Services (10)",
      "Cloud Infrastructure (6)",
      "Networking (5)"
    ],
    sampleCompanies: ["AgroRaptor", "Amazon Connect", "Atain", "Datadog", "Cisco", "Microsoft"],
    primaryPersonas: "Product & IT (32%), Operations & Support (26%), Executive Leadership (23%)",
    voiceAiHook:
      "Sub-200ms sovereign voice engine API, direct SIP trunking, and native multi-language voice-to-voice agents.",
    typicalPains:
      "Custom speech-to-text pipeline latency and expensive GPU runtime charges from rented 3rd-party models."
  },
  {
    id: "retail",
    name: "Retail, E-Commerce & Consumer Brands",
    category: "buyer",
    count: 46,
    pct: 2.7,
    companiesCount: 31,
    subIndustries: [
      "Retail / E-Commerce (12)",
      "Consumer Products (12)",
      "Brands (6)",
      "Food Delivery (6)"
    ],
    sampleCompanies: ["Amazon", "Avocado Green Brands", "Casey's", "City Furniture", "Kohl's", "Grubhub", "Chewy"],
    primaryPersonas: "Operations & Customer Support (54%), Executive Leadership (20%), Product/IT (13%)",
    voiceAiHook:
      "Where-is-my-order (WISMO) lookups, return & exchange handling, order modification, and peak holiday volume absorption.",
    typicalPains:
      "Acute 4x volume spikes during peak Q4 sales and seasonal temp agent training costs."
  },
  {
    id: "public-sector",
    name: "Public Sector, Higher Ed & Non-Profit",
    category: "buyer",
    count: 45,
    pct: 2.7,
    companiesCount: 32,
    subIndustries: [
      "Higher Education (19)",
      "Government / Public Sector (9)",
      "Associations & Non-Profits (13)"
    ],
    sampleCompanies: [
      "American Cancer Society",
      "Ascend Learning",
      "ASWB",
      "BYU-Idaho",
      "Choctaw Nation",
      "Sacramento County"
    ],
    primaryPersonas: "Operations & Support (40%), Executive Leadership (18%), Product/IT (12%)",
    voiceAiHook:
      "Citizen inquiries, student enrollment/financial aid FAQs, examination registration, and license renewals.",
    typicalPains:
      "Fixed government headcount budgets and strict public compliance standards."
  },
  {
    id: "utilities",
    name: "Utilities, Energy & Environmental Services",
    category: "buyer",
    count: 31,
    pct: 1.9,
    companiesCount: 17,
    subIndustries: [
      "Utilities & Energy (25)",
      "Waste Management & Environmental (3)",
      "Public Safety (2)"
    ],
    sampleCompanies: [
      "1074 Recology HQ",
      "AEP (American Electric Power)",
      "Central Arkansas Water",
      "Dominion Energy",
      "SMUD",
      "Las Vegas Valley Water"
    ],
    primaryPersonas: "Operations & Support (48%), Product & IT (23%), Executive Leadership (10%)",
    voiceAiHook:
      "Storm outage emergency call spikes, automated telephone bill payments, and meter read lookups with zero queue hold.",
    typicalPains:
      "Massive 10x call volume spikes during severe weather events overwhelming municipal contact centers."
  },
  {
    id: "travel",
    name: "Travel, Hospitality & Transportation",
    category: "buyer",
    count: 31,
    pct: 1.9,
    companiesCount: 15,
    subIndustries: [
      "Travel & Hospitality (22)",
      "Logistics & Passenger Transport (3)",
      "Airlines (3)"
    ],
    sampleCompanies: [
      "Agility Holdings Group",
      "AmaWaterways Cruises",
      "American Airlines",
      "Expedia Group",
      "Hilton Grand Vacations",
      "Wynn Resorts"
    ],
    primaryPersonas: "Operations & Support (55%), Executive Leadership (26%)",
    voiceAiHook:
      "Flight status inquiries, booking re-confirmations, zero-wait guest concierge calls, and luggage tracking.",
    typicalPains:
      "Weather delays causing severe queue backups and angry passengers waiting 60+ minutes."
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrial",
    category: "buyer",
    count: 14,
    pct: 0.8,
    companiesCount: 12,
    subIndustries: ["Manufacturing & Equipment (10)", "Consumer Goods (4)"],
    sampleCompanies: ["A. O. Smith", "Ace Industrial Supply", "Bob Barker Company", "Cambro", "Electroline Inc."],
    primaryPersonas: "Executive Leadership (36%), Product & IT (29%), Operations (14%)",
    voiceAiHook:
      "B2B parts inventory status, order fulfillment updates, warranty support intake.",
    typicalPains:
      "Distributor order status delays and technical parts catalog navigation."
  },
  {
    id: "automotive",
    name: "Automotive & Auto Services",
    category: "buyer",
    count: 7,
    pct: 0.4,
    companiesCount: 6,
    subIndustries: ["Automotive Dealerships & Networks (6)", "Auto Repair Services (1)"],
    sampleCompanies: ["Caliber Collision", "JM Family Enterprises", "Mercedes-Benz USA", "OPENLANE"],
    primaryPersonas: "CX & Success (29%), Operations & Support (29%), Product/IT (14%)",
    voiceAiHook:
      "Service appointment booking, repair status notifications, vehicle delivery scheduling.",
    typicalPains:
      "High missed call rates at service bays leading to lost maintenance revenue."
  },
  {
    id: "other",
    name: "Other / Diversified Operations",
    category: "other",
    count: 32,
    pct: 1.9,
    companiesCount: 26,
    subIndustries: ["Unclassified Operations (20)", "Logistics & Storage (5)", "Home Services & Food (7)"],
    sampleCompanies: ["ARG", "Atman", "BizApp", "College Hunks Hauling Junk", "Trojan Storage"],
    primaryPersonas: "Executive Leadership (34%), Operations & Support (22%), CX (16%)",
    voiceAiHook:
      "General intake and routing triage for diverse enterprise operations.",
    typicalPains:
      "Repetitive front-desk intake and routing across disparate business lines."
  }
];

export function BreakdownWorkspace() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("ccw");
  const [selectedCcwTier, setSelectedCcwTier] = useState<CcwTier>("tier1_2");
  const [selectedCcwIndustry, setSelectedCcwIndustry] = useState<string>("general");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // CCW Industry Breakdown Filters
  const [ccwIndustrySearch, setCcwIndustrySearch] = useState("");
  const [ccwCategoryFilter, setCcwCategoryFilter] = useState<"all" | "buyer" | "partner">("all");
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);

  const filteredCcwIndustries = useMemo(() => {
    return ccwIndustryData.filter((sector) => {
      if (ccwCategoryFilter !== "all" && sector.category !== ccwCategoryFilter) {
        return false;
      }
      if (!ccwIndustrySearch.trim()) return true;
      const query = ccwIndustrySearch.toLowerCase();
      return (
        sector.name.toLowerCase().includes(query) ||
        sector.voiceAiHook.toLowerCase().includes(query) ||
        sector.sampleCompanies.some((c) => c.toLowerCase().includes(query)) ||
        sector.subIndustries.some((sub) => sub.toLowerCase().includes(query))
      );
    });
  }, [ccwIndustrySearch, ccwCategoryFilter]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CCW Post-Event Campaigns Data
  const ccwTierContent = {
    tier1_2: {
      name: "Campaign 1: Executive Strike",
      subtitle: "Tiers 1 & 2 — 235 High-Priority Leads",
      target: "C-level & VP operations executives (COOs, VPs of Customer Operations, CXOs)",
      strategy:
        "Addresses executive decision fatigue post-CCW. Focuses on avoiding 6-month CCaaS overhaul drag by deploying sub-200ms voice AI over carrier SIP in under 3 weeks to deflect routine volume.",
      subject: "{{company}} / call queue deflection",
      categories: [
        {
          id: "general",
          name: "General Support & Enterprise Operations",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 contact center planning.

Walking the expo floor back in late July, the recurring hesitation contact center leaders shared with us wasn't an unwillingness to automate—it was deployment drag: when monthly billing cycles and payment due-date surges hit, nobody can afford a 6-month telephony overhaul that risks disrupting active customer servicing.

For organizations like {{Company}}, automating routine inquiries around new card activation and security PIN creation shouldn't require ripping out your existing contact center infrastructure. We benchmarked how enterprise operations deploy pre-packaged workflows directly over carrier SIP trunks into core lending and servicing platforms in under 3 weeks: running an in-house voice engine sub-200ms handles customer authentication and resolves repetitive intake conversationally, deflecting 42% of surge volume without caller dead air.

We compiled the SIP flow into a 1-page architecture teardown for telephony teams. Worth passing a copy over to your servicing operations team, or is queue deflection already solved for Q4?`
        },
        {
          id: "bfsi",
          name: "BFSI, Banking & FinTech",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 contact center planning.

Walking the expo floor back in late July, the recurring hesitation contact center leaders shared with us wasn't an unwillingness to automate—it was deployment drag: when morning volume surges hit, nobody can afford a 6-month telephony overhaul that risks disrupting active customer servicing.

For organizations like {{Company}}, automating routine inquiries around new card activation and security PIN creation shouldn't require ripping out your existing contact center infrastructure. We benchmarked how enterprise operations deploy pre-packaged workflows directly over carrier SIP trunks into core banking and card processing systems in under 3 weeks: running an in-house voice engine sub-200ms handles customer authentication and resolves repetitive intake conversationally, deflecting 42% of surge volume without caller dead air.

We compiled the SIP flow into a 1-page architecture teardown for telephony teams. Worth passing a copy over to your contact center operations team, or is queue deflection already solved for Q4?`
        },
        {
          id: "healthcare",
          name: "Healthcare & Patient Access",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 contact center planning.

Walking the expo floor back in late July, the recurring hesitation contact center leaders shared with us wasn't an unwillingness to automate—it was deployment drag: when morning volume surges hit, nobody can afford a 6-month telephony overhaul that risks disrupting active patient servicing.

For organizations like {{Company}}, automating routine inquiries around prescription refill status lookups and doctor prior-authorization hold inquiries shouldn't require ripping out your existing contact center infrastructure. We benchmarked how enterprise operations deploy pre-packaged workflows directly over carrier SIP trunks into pharmacy management and fulfillment platforms in under 3 weeks: running an in-house voice engine sub-200ms handles patient authentication and resolves repetitive intake conversationally, deflecting 42% of surge volume without caller dead air.

We compiled the SIP flow into a 1-page architecture teardown for telephony teams. Worth passing a copy over to your patient services operations team, or is queue deflection already solved for Q4?`
        },
        {
          id: "logistics",
          name: "Logistics, 3PL & Transportation",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 dispatch and fleet planning.

Walking the expo floor back in late July, the recurring hesitation operations leaders shared with us wasn't an unwillingness to automate—it was deployment drag: when morning dispatch check-ins and delivery surges hit, nobody can afford a 6-month telephony overhaul that risks disrupting active carrier servicing.

For organizations like {{Company}}, automating routine inquiries around driver check-in verification and delivery track-and-trace lookups shouldn't require ripping out your existing contact center infrastructure. We benchmarked how enterprise operations deploy pre-packaged workflows directly over carrier SIP trunks into transport management and fleet dispatch platforms in under 3 weeks: running an in-house voice engine sub-200ms handles driver authentication and resolves repetitive intake conversationally, deflecting 42% of surge volume without caller dead air.

We compiled the SIP flow into a 1-page architecture teardown for telephony teams. Worth passing a copy over to your fleet operations team, or is queue deflection already solved for Q4?`
        }
      ]
    },
    tier3: {
      name: "Campaign 2: Mid-Market Scale",
      subtitle: "Tier 3 — 462 Leads",
      target: "Director-level contact center leaders, telephony managers, and operational evaluators",
      strategy:
        "Focuses on solving audio lag and caller dead air in standard CCaaS bots by connecting an in-house sub-200ms voice engine over direct SIP to contain 42% of morning appointment, balance, or order surges.",
      subject: "{{company}} / call queue deflection",
      categories: [
        {
          id: "clinical",
          name: "Healthcare & Clinical Operations",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 patient access planning.

Walking the expo floor back in July, contact center leaders consistently noted that when morning appointment and intake surges hit, having senior advocates bogged down in routine appointment scheduling and insurance verification inquiries drives acute queue spikes that standard CCaaS bots fail to contain due to audio latency.

We deployed an in-house voice engine over direct carrier SIP that connects into clinical EHR and patient scheduling systems in three weeks. It handles patient authentication and resolves routine workflow intake at sub-200ms latency, deflecting 42% of routine volume without telephony rip-and-replace.

Would a 1-page architecture teardown be helpful for your patient access operations team, or is queue deflection already solved?`
        },
        {
          id: "retail",
          name: "Customer Support & Retail Operations",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 contact center planning.

Walking the expo floor back in late July, the recurring hesitation contact center leaders shared with us wasn't an unwillingness to automate—it was deployment drag: when promotional and seasonal order surges hit, nobody can afford a 6-month telephony overhaul that risks disrupting active customer servicing.

For organizations like {{Company}}, automating routine inquiries around order tracking, subscription modifications, and replacement dispatch shouldn't require ripping out your existing contact center infrastructure. We benchmarked how consumer operations deploy pre-packaged workflows directly over carrier SIP trunks into Shopify and customer support platforms in under 3 weeks: running an in-house voice engine sub-200ms handles customer authentication and resolves repetitive intake conversationally, deflecting 42% of surge volume without caller dead air.

We compiled the SIP flow into a 1-page architecture teardown for telephony teams. Worth passing a copy over to your customer operations team, or is queue deflection already solved for Q4?`
        },
        {
          id: "bfsi_servicing",
          name: "BFSI & Financial Servicing",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 contact center planning.

Walking the expo floor back in late July, the recurring hesitation contact center leaders shared with us wasn't an unwillingness to automate—it was deployment drag: when monthly billing cycles and payment due-date surges hit, nobody can afford a 6-month telephony overhaul that risks disrupting active customer servicing.

For organizations like {{Company}}, automating routine inquiries around auto loan balance lookups, payment arrangement scheduling, and payoff quotes shouldn't require ripping out your existing contact center infrastructure. We benchmarked how enterprise operations deploy pre-packaged workflows directly over carrier SIP trunks into core auto financing and servicing platforms in under 3 weeks: running an in-house voice engine sub-200ms handles borrower authentication and resolves repetitive intake conversationally, deflecting 42% of surge volume without caller dead air.

We compiled the SIP flow into a 1-page architecture teardown for telephony teams. Worth passing a copy over to your servicing operations team, or is queue deflection already solved for Q4?`
        }
      ]
    },
    tier4: {
      name: "Campaign 3: Enterprise & Extended Scale",
      subtitle: "Tier 4 Buyers — 639 Leads",
      target: "Enterprise operations & transformation executives (multi-location networks, large contact centers)",
      strategy:
        "Emphasizes rapid SIP overlay to tackle specific routine spikes (debit card locks, claims eligibility, dispatch requests) without displacing existing enterprise telephony (Genesys, Cisco, Avaya).",
      subject: "{{company}} / call queue deflection",
      categories: [
        {
          id: "banking_ops",
          name: "BFSI & Banking Operations",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 customer care planning.

Walking the expo floor back in July, contact center leaders consistently noted that when morning volume surges hit, having senior advocates bogged down in routine debit card lockouts and account verification inquiries drives acute queue spikes that standard CCaaS bots fail to contain due to audio latency.

We deployed an in-house voice engine over direct carrier SIP that connects into core banking and card servicing platforms in three weeks. It handles customer authentication and resolves routine workflow intake at sub-200ms latency, deflecting 42% of routine volume without telephony rip-and-replace.

Would a 1-page architecture teardown be helpful for your contact center operations team, or is queue deflection already solved?`
        },
        {
          id: "dental_health",
          name: "Healthcare, Dental & Member Services",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 member services planning.

Walking the expo floor back in July, contact center leaders consistently noted that when open enrollment and Monday morning surges hit, having senior advocates bogged down in routine dental benefits eligibility checks and claim status inquiries drives acute queue spikes that standard CCaaS bots fail to contain due to audio latency.

We deployed an in-house voice engine over direct carrier SIP that connects into core claims and member administration platforms in three weeks. It handles member authentication and resolves routine workflow intake at sub-200ms latency, deflecting 42% of routine volume without telephony rip-and-replace.

Would a 1-page architecture teardown be helpful for your member services operations team, or is queue deflection already solved?`
        },
        {
          id: "facilities",
          name: "Field Dispatch & Property Operations",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 service and dispatch planning.

Walking the expo floor back in late July, the recurring hesitation operations leaders shared with us wasn't an unwillingness to automate—it was deployment drag: when morning dispatch and scheduling surges hit, nobody can afford a 6-month telephony overhaul that risks disrupting active resident and customer servicing.

For institutions like {{Company}}, automating routine call surges around emergency HVAC maintenance intake and repair dispatch scheduling shouldn't require ripping out your existing telephony. We benchmarked how regional operations deploy pre-packaged workflows directly over SIP into field dispatch and property management platforms in under 3 weeks: running an in-house voice engine sub-200ms handles resident and customer authentication and resolves repetitive intake conversationally, deflecting 42% of morning volume without caller dead air.

We compiled the SIP flow into a 1-page architecture teardown for telephony teams. Worth passing a copy over to your customer operations team, or is queue deflection already solved for Q4?`
        },
        {
          id: "automotive",
          name: "Automotive & Connected Operations",
          body: `{{FirstName}},

Checking in a few months after CCW Vegas as teams finalize Q4 customer and dispatch planning.

Walking the expo floor back in July, contact center leaders consistently noted that when morning commute and servicing surges hit, having senior advocates bogged down in routine service scheduling and dispatch or account status inquiries drives acute queue spikes that standard CCaaS bots fail to contain due to audio latency.

We deployed an in-house voice engine over direct carrier SIP that connects into dispatch and automotive servicing platforms in three weeks. It handles driver authentication and resolves routine workflow intake at sub-200ms latency, deflecting 42% of routine volume without telephony rip-and-replace.

Would a 1-page architecture teardown be helpful for your customer operations team, or is queue deflection already solved?`
        }
      ]
    }
  };

  // Current selected CCW Tier
  const currentCcwTier = ccwTierContent[selectedCcwTier];
  const activeCcwCategory =
    currentCcwTier.categories.find((c) => c.id === selectedCcwIndustry) || currentCcwTier.categories[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          title="Campaign & Data Breakdown"
          subtitle="Independent performance and messaging analysis for CCW Las Vegas, US Enterprise Outbound, and Competitive Displacement."
        />
        <div className="flex items-center gap-2">
          <StatusBadge tone="good">29 Total Meetings</StatusBadge>
          <span className="border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">
            21,184+ Total Touches
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-b border-zinc-800">
        <nav className="-mb-px flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`focus-ring flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
              activeTab === "overview"
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <Layers className="size-3.5" />
            Executive Overview
          </button>

          <button
            onClick={() => setActiveTab("ccw")}
            className={`focus-ring flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
              activeTab === "ccw"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <Calendar className="size-3.5 text-amber-400" />
            CCW Campaign (Pre & Post)
            <span className="ml-1 rounded-full bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 text-[10px] text-amber-300">
              28 Mtgs
            </span>
          </button>

          <button
            onClick={() => setActiveTab("outbound")}
            className={`focus-ring flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
              activeTab === "outbound"
                ? "border-blue-400 text-blue-300"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <Building2 className="size-3.5 text-blue-400" />
            US Outbound Pipeline
            <span className="ml-1 rounded-full bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.2 text-[10px] text-blue-300">
              1 Mtg
            </span>
          </button>

          <button
            onClick={() => setActiveTab("displacement")}
            className={`focus-ring flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
              activeTab === "displacement"
                ? "border-rose-400 text-rose-300"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <Swords className="size-3.5 text-rose-400" />
            Competitive Displacement (Instantly)
          </button>
        </nav>
      </div>

      {/* =========================================================================
          TAB 1: EXECUTIVE OVERVIEW
          ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Scorecard */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="p-4 bg-zinc-950">
              <p className="text-xs text-zinc-500">Total Outbound Touches</p>
              <p className="mono mt-2 text-2xl font-semibold text-zinc-100">21,184+</p>
              <p className="mt-1 text-[11px] text-zinc-500">Across all initiatives</p>
            </Card>
            <Card className="p-4 bg-zinc-950">
              <p className="text-xs text-zinc-500">Total Emails Delivered</p>
              <p className="mono mt-2 text-2xl font-semibold text-zinc-100">16,012</p>
              <p className="mt-1 text-[11px] text-zinc-500">CCW, Outbound, Instantly</p>
            </Card>
            <Card className="p-4 bg-zinc-950">
              <p className="text-xs text-zinc-500">Total Cold Dials Made</p>
              <p className="mono mt-2 text-2xl font-semibold text-zinc-100">4,972+</p>
              <p className="mt-1 text-[11px] text-zinc-500">3,432 CCW pre + 1,540 US cold</p>
            </Card>
            <Card className="p-4 bg-zinc-950">
              <p className="text-xs text-zinc-500">Replies & Conversations</p>
              <p className="mono mt-2 text-2xl font-semibold text-zinc-100">291</p>
              <p className="mt-1 text-[11px] text-zinc-500">Direct two-way engagements</p>
            </Card>
            <Card className="p-4 border-zinc-700 bg-zinc-900/40">
              <p className="text-xs text-zinc-400 font-medium">Qualified Meetings Booked</p>
              <p className="mono mt-2 text-2xl font-bold text-white">29</p>
              <p className="mt-1 text-[11px] text-emerald-400 font-medium">28 CCW + 1 US Outbound</p>
            </Card>
          </div>

          {/* Three Initiatives Side-by-Side Summary */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Three Distinct Outreach Initiatives</h3>
                <p className="text-xs text-zinc-500">Direct volume and performance comparison.</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">3 Programs</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="pb-3 font-medium">Initiative</th>
                    <th className="pb-3 font-medium">Channels Deployed</th>
                    <th className="pb-3 font-medium text-right">Volume</th>
                    <th className="pb-3 font-medium text-right">Engagement</th>
                    <th className="pb-3 font-medium text-right">Meetings Booked</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3.5 font-medium text-zinc-100 flex items-center gap-2">
                      <Calendar className="size-3.5 text-amber-400" />
                      CCW Las Vegas Outreach (Pre & Post)
                    </td>
                    <td className="py-3.5 text-zinc-400">Cold Calling + Cold Emailing (3 Tiers)</td>
                    <td className="py-3.5 mono text-right text-zinc-200">14,900 touches</td>
                    <td className="py-3.5 mono text-right text-zinc-200">143 email replies</td>
                    <td className="py-3.5 mono text-right text-emerald-400 font-bold text-sm">28</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setActiveTab("ccw")}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                      >
                        View Campaign <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3.5 font-medium text-zinc-100 flex items-center gap-2">
                      <Building2 className="size-3.5 text-blue-400" />
                      US Outbound Pipeline
                    </td>
                    <td className="py-3.5 text-zinc-400">Research-Tailored Calling, Emailing & LinkedIn</td>
                    <td className="py-3.5 mono text-right text-zinc-200">4,984 touches</td>
                    <td className="py-3.5 mono text-right text-zinc-200">122 calls + 14 replies</td>
                    <td className="py-3.5 mono text-right text-emerald-400 font-bold text-sm">1</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setActiveTab("outbound")}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
                      >
                        View Pipeline <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3.5 font-medium text-zinc-100 flex items-center gap-2">
                      <Swords className="size-3.5 text-rose-400" />
                      Competitive Displacement (Instantly)
                    </td>
                    <td className="py-3.5 text-zinc-400">Instantly Voice AI Poaching Sequence</td>
                    <td className="py-3.5 mono text-right text-zinc-200">1,300 delivered</td>
                    <td className="py-3.5 mono text-right text-zinc-200">2% reply rate</td>
                    <td className="py-3.5 mono text-right text-zinc-400">0</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setActiveTab("displacement")}
                        className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
                      >
                        View Sequences <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CCW CAMPAIGN (PRE & POST EVENT + 3 CAMPAIGN TIERS)
          ========================================================================= */}
      {activeTab === "ccw" && (
        <div className="space-y-6">
          {/* Top Stage Split: Pre-Event vs Post-Event Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pre-Event Card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Stage 1
                  </span>
                  <h3 className="text-base font-semibold text-zinc-100">CCW Pre-Event Outreach</h3>
                  <p className="text-xs text-zinc-500">Las Vegas booth pre-booking campaign.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500">Pre-Booked Total</span>
                  <p className="mono text-lg font-bold text-emerald-400">20 Meetings</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-zinc-800/80 bg-zinc-950 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Phone className="size-3 text-zinc-500" /> Cold Calling
                  </div>
                  <p className="mono text-xl font-semibold text-zinc-100">3,432</p>
                  <p className="text-[11px] text-zinc-500">Total Leads Dialed</p>
                  <div className="border-t border-zinc-800 pt-1 text-xs text-emerald-400 font-medium">
                    16 Booth Meetings Booked
                  </div>
                </div>

                <div className="rounded border border-zinc-800/80 bg-zinc-950 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Mail className="size-3 text-zinc-500" /> Cold Emailing
                  </div>
                  <p className="mono text-xl font-semibold text-zinc-100">5,234</p>
                  <p className="text-[11px] text-zinc-500">60% Open • 80 Replies</p>
                  <div className="border-t border-zinc-800 pt-1 text-xs text-emerald-400 font-medium">
                    4 Booth Meetings Booked
                  </div>
                </div>
              </div>
            </Card>

            {/* Post-Event Card */}
            <Card className="p-5 space-y-4 border-amber-900/40 bg-zinc-950/70">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400">
                    Stage 2 (Primary Post-Event)
                  </span>
                  <h3 className="text-base font-semibold text-zinc-100">CCW Post-Event Outreach</h3>
                  <p className="text-xs text-zinc-500">Follow-up with CCW Las Vegas attendees.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500">Post-Event Converted</span>
                  <p className="mono text-lg font-bold text-emerald-400">8 Meetings</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-zinc-800/80 bg-zinc-950 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Mail className="size-3 text-zinc-500" /> Cold Emailing
                  </div>
                  <p className="mono text-xl font-semibold text-zinc-100">6,234</p>
                  <p className="text-[11px] text-zinc-500">65% Open • 63 Replies</p>
                  <div className="border-t border-zinc-800 pt-1 text-xs text-emerald-400 font-medium">
                    8 Meetings Booked
                  </div>
                </div>

                <div className="rounded border border-zinc-800/80 bg-zinc-950 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Phone className="size-3 text-zinc-500" /> Calling Pipeline
                  </div>
                  <p className="mono text-xl font-semibold text-zinc-100">1,673</p>
                  <p className="text-[11px] text-zinc-500">Clean Callable Leads</p>
                  <div className="border-t border-zinc-800 pt-1 text-xs text-zinc-400 font-medium">
                    6 Persona Segments
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* =========================================================================
              CCW INDUSTRY & PERSONA INTELLIGENCE BREAKDOWN (1,674 LEADS)
              ========================================================================= */}
          <Card className="p-6 space-y-6 border-zinc-800 bg-zinc-950/80">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <BarChart3 className="size-3" /> Account & Vertical Intelligence
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-1">
                  CCW Leads Mapped by Industry & Persona (1,674 Leads)
                </h3>
                <p className="text-xs text-zinc-400">
                  Granular distribution across 16 vertical sectors, 870+ unique enterprises, and 6 core buyer personas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone="good">80% Enterprise Buyers</StatusBadge>
                <StatusBadge tone="neutral">14% Tech Ecosystem</StatusBadge>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Total Master Leads</span>
                  <Users className="size-3.5 text-zinc-500" />
                </div>
                <p className="mono text-2xl font-bold text-zinc-100">1,674</p>
                <p className="text-[11px] text-zinc-500">1,633 clean callable after purge</p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Direct Buyer Targets</span>
                  <Target className="size-3.5 text-emerald-400" />
                </div>
                <p className="mono text-2xl font-bold text-emerald-400">1,336</p>
                <p className="text-[11px] text-zinc-500">79.8% across Tiers 1-4</p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Unique Enterprises</span>
                  <Building2 className="size-3.5 text-blue-400" />
                </div>
                <p className="mono text-2xl font-bold text-blue-400">870+</p>
                <p className="text-[11px] text-zinc-500">From Fortune 500 to Mid-Market</p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>CX & AI Tech Vendors</span>
                  <Layers className="size-3.5 text-violet-400" />
                </div>
                <p className="mono text-2xl font-bold text-violet-400">238</p>
                <p className="text-[11px] text-zinc-500">14.2% partners & adjacent vendors</p>
              </div>
            </div>

            {/* Persona Seniority Distribution Widget */}
            <div className="rounded border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Users className="size-3.5 text-amber-400" /> Persona & Seniority Distribution
                </span>
                <span className="text-[11px] text-zinc-500">100% of callable contacts classified</span>
              </div>

              {/* Progress Bar Stack */}
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                {ccwPersonaData.map((p) => (
                  <div
                    key={p.name}
                    className={`${p.color} h-full transition-all`}
                    style={{ width: `${p.pct}%` }}
                    title={`${p.name}: ${p.count} leads (${p.pct}%)`}
                  />
                ))}
              </div>

              {/* Persona Pills Grid */}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-1">
                {ccwPersonaData.map((p) => (
                  <div key={p.name} className="flex items-start gap-2 rounded border border-zinc-800/60 bg-zinc-950 p-2.5">
                    <span className={`mt-1 size-2 rounded-full ${p.color} shrink-0`} />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-zinc-200 truncate">{p.name}</span>
                        <span className="mono text-xs font-bold text-zinc-100">{p.count}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{p.pct}% of total • {p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Explorer & Filter Header */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setCcwCategoryFilter("all")}
                    className={`focus-ring rounded border px-3 py-1.5 text-xs font-medium transition ${
                      ccwCategoryFilter === "all"
                        ? "border-amber-400/80 bg-zinc-900 text-zinc-100"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    All Sectors ({ccwIndustryData.length})
                  </button>
                  <button
                    onClick={() => setCcwCategoryFilter("buyer")}
                    className={`focus-ring rounded border px-3 py-1.5 text-xs font-medium transition ${
                      ccwCategoryFilter === "buyer"
                        ? "border-emerald-500/80 bg-zinc-900 text-emerald-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Direct Buyers ({ccwIndustryData.filter((s) => s.category === "buyer").length})
                  </button>
                  <button
                    onClick={() => setCcwCategoryFilter("partner")}
                    className={`focus-ring rounded border px-3 py-1.5 text-xs font-medium transition ${
                      ccwCategoryFilter === "partner"
                        ? "border-violet-500/80 bg-zinc-900 text-violet-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Tech Vendors & Partners ({ccwIndustryData.filter((s) => s.category === "partner").length})
                  </button>
                </div>

                {/* Real-time Search Box */}
                <div className="relative min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={ccwIndustrySearch}
                    onChange={(e) => setCcwIndustrySearch(e.target.value)}
                    placeholder="Search industry or account (e.g. BFSI, Aflac)..."
                    className="focus-ring w-full rounded border border-zinc-800 bg-zinc-900/90 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500"
                  />
                  {ccwIndustrySearch && (
                    <button
                      onClick={() => setCcwIndustrySearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-zinc-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Sectors Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredCcwIndustries.map((sector) => {
                  const isExpanded = expandedSectorId === sector.id;
                  return (
                    <div
                      key={sector.id}
                      className={`rounded border transition p-4 space-y-3 bg-zinc-950 ${
                        isExpanded
                          ? "border-amber-400/70 shadow-sm"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {/* Top Row: Title, Category Badge, Count & Share */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-zinc-100">{sector.name}</h4>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-medium border ${
                                sector.category === "buyer"
                                  ? "border-emerald-800/80 bg-emerald-950/40 text-emerald-400"
                                  : sector.category === "partner"
                                  ? "border-violet-800/80 bg-violet-950/40 text-violet-400"
                                  : "border-zinc-700 bg-zinc-900 text-zinc-400"
                              }`}
                            >
                              {sector.category === "buyer"
                                ? "Direct Buyer"
                                : sector.category === "partner"
                                ? "Tech Vendor"
                                : "Diversified"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {sector.companiesCount} unique accounts • Primary: {sector.primaryPersonas}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="mono text-sm font-bold text-amber-400">{sector.count} leads</span>
                          <p className="text-[10px] text-zinc-500">{sector.pct}% of CCW</p>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                        <div
                          className={`h-full ${
                            sector.category === "buyer"
                              ? "bg-amber-400"
                              : sector.category === "partner"
                              ? "bg-violet-400"
                              : "bg-zinc-400"
                          }`}
                          style={{ width: `${Math.min(sector.pct * 5, 100)}%` }}
                        />
                      </div>

                      {/* Sample Accounts Pills */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                          Sample Enterprise Accounts:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sector.sampleCompanies.map((comp) => (
                            <span
                              key={comp}
                              className="inline-flex items-center rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-300"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Voice AI Hook / Wedge */}
                      <div className="rounded border border-amber-900/30 bg-amber-950/20 p-2.5 text-xs text-amber-200/90 leading-relaxed">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-amber-400 mb-1">
                          <Zap className="size-3" /> Voice AI Value Proposition
                        </div>
                        {sector.voiceAiHook}
                      </div>

                      {/* Expandable Section */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-xs">
                          <div>
                            <span className="text-zinc-500 font-medium text-[11px]">Sub-Industries:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sector.subIndustries.map((sub) => (
                                <span
                                  key={sub}
                                  className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400 border border-zinc-800"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium text-[11px]">Core Operational Pains:</span>
                            <p className="text-zinc-400 mt-0.5 leading-relaxed">{sector.typicalPains}</p>
                          </div>
                        </div>
                      )}

                      {/* Toggle Expand / Collapse Button */}
                      <button
                        onClick={() => setExpandedSectorId(isExpanded ? null : sector.id)}
                        className="w-full flex items-center justify-center gap-1 pt-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <ChevronUp className="size-3" />
                          </>
                        ) : (
                          <>
                            <span>View Sub-Industries & Operational Pains</span>
                            <ChevronDown className="size-3" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {filteredCcwIndustries.length === 0 && (
                <div className="rounded border border-zinc-800 p-8 text-center text-zinc-500">
                  <p className="text-sm">No industry or company matched &ldquo;{ccwIndustrySearch}&rdquo;.</p>
                  <button
                    onClick={() => {
                      setCcwIndustrySearch("");
                      setCcwCategoryFilter("all");
                    }}
                    className="mt-2 text-xs text-amber-400 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* =========================================================================
              CCW POST-EVENT CONTENT & SEQUENCES VAULT
              ========================================================================= */}
          <Card className="p-6 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="size-3" /> Post-CCW Email Campaigns by Tier & Industry
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-1">
                  Exact Email Copy Deployed for CCW Follow-Up
                </h3>
                <p className="text-xs text-zinc-500">
                  Targeted messaging addressing executive deployment drag, SIP integration, and sub-200ms latency.
                </p>
              </div>
              <StatusBadge tone="good">1,336 Tiered Leads</StatusBadge>
            </div>

            {/* Campaign Tier Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "tier1_2", label: "Campaign 1: Executive Strike", leads: "Tiers 1 & 2 • 235 Leads" },
                  { id: "tier3", label: "Campaign 2: Mid-Market Scale", leads: "Tier 3 • 462 Leads" },
                  { id: "tier4", label: "Campaign 3: Enterprise Scale", leads: "Tier 4 • 639 Leads" }
                ] as const
              ).map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    setSelectedCcwTier(tier.id);
                    setSelectedCcwIndustry(ccwTierContent[tier.id].categories[0].id);
                  }}
                  className={`focus-ring rounded border px-3.5 py-2 text-left transition ${
                    selectedCcwTier === tier.id
                      ? "border-amber-400/80 bg-zinc-900 text-zinc-100 shadow-sm"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <p className="text-xs font-semibold">{tier.label}</p>
                  <p className="text-[10px] text-zinc-500">{tier.leads}</p>
                </button>
              ))}
            </div>

            {/* Campaign Tier Meta Box */}
            <div className="rounded border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-200">{currentCcwTier.name}</span>
                <span className="text-[11px] text-zinc-500">{currentCcwTier.subtitle}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <span className="text-zinc-500 font-medium">Target Audience:</span> {currentCcwTier.target}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <span className="text-zinc-500 font-medium">Campaign Strategy:</span> {currentCcwTier.strategy}
              </p>
            </div>

            {/* Category / Industry Selector Pills */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Select Industry Vertical Copy
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentCcwTier.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCcwIndustry(cat.id)}
                    className={`focus-ring px-3 py-1.5 text-xs font-medium rounded border transition ${
                      activeCcwCategory.id === cat.id
                        ? "border-zinc-300 bg-zinc-800 text-zinc-100"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Body Display Box */}
            <div className="rounded border border-zinc-800 bg-zinc-950 overflow-hidden">
              {/* Subject Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-medium">Subject:</span>
                  <span className="mono text-xs text-zinc-200">{currentCcwTier.subject}</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(`Subject: ${currentCcwTier.subject}\n\n${activeCcwCategory.body}`, "ccw-body")
                  }
                  className="focus-ring flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-100 transition border border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                >
                  {copiedId === "ccw-body" ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>

              {/* Email Content Body */}
              <div className="p-5">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-zinc-300 selection:bg-zinc-800">
                  {activeCcwCategory.body}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 3: US OUTBOUND PIPELINE + RESEARCH-DRIVEN EMAIL CONTENT
          ========================================================================= */}
      {activeTab === "outbound" && (
        <div className="space-y-6">
          {/* US Outbound Metric Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Calling */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  Outbound Calling
                </span>
                <Phone className="size-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="mono text-2xl font-semibold text-zinc-100">1,540 dials</p>
                <p className="text-xs text-zinc-400 mt-0.5">Across 203 Target Enterprise Accounts</p>
              </div>
              <div className="space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Connected Conversations:</span>
                  <span className="mono text-zinc-200 font-medium">122 (7.9% connect)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Meetings Booked:</span>
                  <span className="mono text-zinc-400 font-medium">0</span>
                </div>
              </div>
            </Card>

            {/* Emailing */}
            <Card className="p-4 space-y-3 border-blue-900/40 bg-zinc-950/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">
                  Research-Driven Emailing
                </span>
                <Mail className="size-3.5 text-blue-400" />
              </div>
              <div>
                <p className="mono text-2xl font-semibold text-zinc-100">3,244 emails</p>
                <p className="text-xs text-zinc-400 mt-0.5">Customized per Account Hiring Signal</p>
              </div>
              <div className="space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Open Rate:</span>
                  <span className="mono text-zinc-200 font-medium">58% (~1,882 opens)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Replies:</span>
                  <span className="mono text-zinc-200 font-medium">14 replies</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800/80 pt-1 text-emerald-400 font-medium">
                  <span>Meetings Booked:</span>
                  <span className="mono font-bold">1 meeting</span>
                </div>
              </div>
            </Card>

            {/* LinkedIn Organic */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  LinkedIn Organic
                </span>
                <Linkedin className="size-3.5 text-blue-400" />
              </div>
              <div>
                <p className="mono text-2xl font-semibold text-zinc-100">200 requests</p>
                <p className="text-xs text-zinc-400 mt-0.5">Executive Peer-to-Peer Outreach</p>
              </div>
              <div className="space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Accepted:</span>
                  <span className="mono text-zinc-200 font-medium">4 (2.0% accept)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Active Conversations:</span>
                  <span className="mono text-zinc-200 font-medium">10 conversations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Meetings Booked:</span>
                  <span className="mono text-zinc-400 font-medium">0</span>
                </div>
              </div>
            </Card>
          </div>

          {/* US Outbound Content Showcase */}
          <Card className="p-6 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Target className="size-3" /> Account Research Trigger Method
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-1">
                  US Outbound Email Strategy & Live Example
                </h3>
                <p className="text-xs text-zinc-500">
                  Each email was custom-written around specific open engineering/telephony requisitions and LOS workflows.
                </p>
              </div>
              <StatusBadge tone="neutral">1 Meeting Converted</StatusBadge>
            </div>

            {/* Strategy Highlights */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Briefcase className="size-3 text-blue-400" /> 1. Requisition Trigger Hook
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Anchors the message directly in an active hiring post (e.g. Sr. Telephony Analyst) to shortcut the engineering backlog.
                </p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Zap className="size-3 text-blue-400" /> 2. Core Architecture Proof
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Highlights sub-500ms voice AI connecting directly into Loan Origination Systems (LOS) with financial compliance.
                </p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="size-3 text-emerald-400" /> 3. Peer Benchmark Metric
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Cites a peer mortgage servicer deploying in 3 weeks and deflecting 68% of routine borrower status calls.
                </p>
              </div>
            </div>

            {/* Email Display Container */}
            <div className="rounded border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-medium">Context:</span>
                  <span className="mono text-xs text-blue-300">Target: Margarita @ Selene Finance LP</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Hi Margarita,

Saw your open requisition for a Sr. Telephony Analyst at Selene Finance LP. If the goal is automating routine borrower loan status updates and payoff inquiries without building speech pipelines from scratch, we can shortcut the engineering runway.

We run a sub-500ms conversational Voice AI engine that connects directly to Loan Origination Systems (LOS) and CCaaS routing with full financial compliance guardrails.

A peer mortgage servicing client facing the same multi-quarter AI engineering backlog deployed our voice agents in 3 weeks, deflecting 68% of routine borrower status calls.

Before locking in a full hiring and development cycle, can I send a 1-page architecture comparison showing what's already pre-built for loan servicing calls? (No sales pitch).`,
                      "us-outbound-email"
                    )
                  }
                  className="focus-ring flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-100 transition border border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                >
                  {copiedId === "us-outbound-email" ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-zinc-300 selection:bg-zinc-800">
{`Hi Margarita,

Saw your open requisition for a Sr. Telephony Analyst at Selene Finance LP. If the goal is automating routine borrower loan status updates and payoff inquiries without building speech pipelines from scratch, we can shortcut the engineering runway.

We run a sub-500ms conversational Voice AI engine that connects directly to Loan Origination Systems (LOS) and CCaaS routing with full financial compliance guardrails.

A peer mortgage servicing client facing the same multi-quarter AI engineering backlog deployed our voice agents in 3 weeks, deflecting 68% of routine borrower status calls.

Before locking in a full hiring and development cycle, can I send a 1-page architecture comparison showing what's already pre-built for loan servicing calls? (No sales pitch).`}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 4: COMPETITIVE DISPLACEMENT (INSTANTLY)
          ========================================================================= */}
      {activeTab === "displacement" && (
        <div className="space-y-6">
          {/* Instantly Metric Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  Target Audience
                </span>
                <Target className="size-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="mono text-2xl font-semibold text-zinc-100">312 accounts</p>
                <p className="text-xs text-zinc-400 mt-0.5">Enrolled Incumbent Voice AI Users</p>
              </div>
              <div className="space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Platform:</span>
                  <span className="text-zinc-200 font-medium">Instantly.ai</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Strategy:</span>
                  <span className="text-zinc-200 font-medium">Poach & Displace</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  Sending Volume
                </span>
                <Mail className="size-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="mono text-2xl font-semibold text-zinc-100">1,300 delivered</p>
                <p className="text-xs text-zinc-400 mt-0.5">Dispatched Across Enrolled Leads</p>
              </div>
              <div className="space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Average Sends/Lead:</span>
                  <span className="mono text-zinc-200 font-medium">~4.1 touches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Execution Status:</span>
                  <span className="text-zinc-200 font-medium">Complete</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  Replies & Pipeline
                </span>
                <Swords className="size-3.5 text-rose-400" />
              </div>
              <div>
                <p className="mono text-2xl font-semibold text-zinc-100">2% reply rate</p>
                <p className="text-xs text-zinc-400 mt-0.5">Engagement on Migration Hook</p>
              </div>
              <div className="space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Positive Replies:</span>
                  <span className="mono text-zinc-400 font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Displacement Demos:</span>
                  <span className="mono text-zinc-400 font-medium">0</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Instantly Displacement Content Showcase */}
          <Card className="p-6 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Swords className="size-3" /> Instantly Competitor Poaching Sequence
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-1">
                  Competitive Displacement Email Copy
                </h3>
                <p className="text-xs text-zinc-500">
                  Targeting accounts running incumbent voice solutions with Gnani’s 10M+ scale and ROI metrics.
                </p>
              </div>
              <StatusBadge tone="warn">Instantly Template</StatusBadge>
            </div>

            {/* Value Proposition Strategy */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs font-medium text-zinc-200">Scale & Architecture Comparison</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Positions Gnani’s 10M+ daily AI voice workflows and 22+ languages against architectural limitations of the prospect’s current vendor (<span className="text-zinc-300 font-mono">&#123;&#123;personalization&#125;&#125;</span>).
                </p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs font-medium text-zinc-200">Outcome Shift (Beyond Handle Time)</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Shifts the conversation from superficial AHT to financial business outcomes: revenue recovered, retention improved, and reduced cost-to-serve.
                </p>
              </div>
            </div>

            {/* Email Content Box */}
            <div className="rounded border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-medium">Dynamic Variables:</span>
                  <span className="mono text-[11px] text-rose-300">&#123;&#123;firstName&#125;&#125;, &#123;&#123;companyName&#125;&#125;, &#123;&#123;personalization&#125;&#125;</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Hi {{firstName}}

{{companyName}} is running on {{personalization}} . Here's the comparison worth having: Gnani processes 10 million+ AI-driven voice interactions every single day, across 22+ languages at a scale most vendors in this category, {{personalization}} included, simply aren't architected for.

And the enterprises that make the switch aren't measuring the change in handling time. They're measuring it in revenue recovered, retention improved, and cost-to-serve reduced.

Worth 15 minutes to see how this stacks up against what {{personalization}} is giving you today?`,
                      "displacement-email"
                    )
                  }
                  className="focus-ring flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-100 transition border border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                >
                  {copiedId === "displacement-email" ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-zinc-300 selection:bg-zinc-800">
{`Hi {{firstName}}

{{companyName}} is running on {{personalization}} . Here's the comparison worth having: Gnani processes 10 million+ AI-driven voice interactions every single day, across 22+ languages at a scale most vendors in this category, {{personalization}} included, simply aren't architected for.

And the enterprises that make the switch aren't measuring the change in handling time. They're measuring it in revenue recovered, retention improved, and cost-to-serve reduced.

Worth 15 minutes to see how this stacks up against what {{personalization}} is giving you today?`}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
