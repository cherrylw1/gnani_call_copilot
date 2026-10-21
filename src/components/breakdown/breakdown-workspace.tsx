"use client";

import { useState } from "react";
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
  Target
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type ActiveTab = "overview" | "ccw" | "outbound" | "displacement";
type CcwTier = "tier1_2" | "tier3" | "tier4";

export function BreakdownWorkspace() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("ccw");
  const [selectedCcwTier, setSelectedCcwTier] = useState<CcwTier>("tier1_2");
  const [selectedCcwIndustry, setSelectedCcwIndustry] = useState<string>("general");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
