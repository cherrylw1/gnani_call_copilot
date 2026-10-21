"use client";

import { useState } from "react";
import {
  Layers,
  Phone,
  Mail,
  Linkedin,
  Swords,
  Calendar,
  FileText,
  Users,
  Building2,
  ArrowRight
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type ActiveTab = "overview" | "ccw" | "outbound" | "displacement";

export function BreakdownWorkspace() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          title="Campaign & Data Breakdown"
          subtitle="Detailed performance and messaging breakdown separated across CCW, US Outbound, and Competitive Displacement."
        />
        <div className="flex items-center gap-2">
          <StatusBadge tone="good">29 Total Meetings</StatusBadge>
          <span className="border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">
            21,184+ Total Touches
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs - Fully Separated */}
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
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <Calendar className="size-3.5 text-amber-400" />
            CCW Campaign (Pre & Post)
            <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300">
              28 Mtgs
            </span>
          </button>

          <button
            onClick={() => setActiveTab("outbound")}
            className={`focus-ring flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
              activeTab === "outbound"
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <Building2 className="size-3.5 text-blue-400" />
            US Outbound Pipeline
            <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300">
              1 Mtg
            </span>
          </button>

          <button
            onClick={() => setActiveTab("displacement")}
            className={`focus-ring flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
              activeTab === "displacement"
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <Swords className="size-3.5 text-rose-400" />
            Competitive Displacement
            <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300">
              Instantly
            </span>
          </button>
        </nav>
      </div>

      {/* =========================================================================
          TAB 1: EXECUTIVE OVERVIEW
          ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* High-Level Scorecards */}
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
              <p className="mt-1 text-[11px] text-zinc-500">CCW Pre & US Outbound</p>
            </Card>
            <Card className="p-4 bg-zinc-950">
              <p className="text-xs text-zinc-500">Replies & Conversations</p>
              <p className="mono mt-2 text-2xl font-semibold text-zinc-100">291</p>
              <p className="mt-1 text-[11px] text-zinc-500">Direct engagements</p>
            </Card>
            <Card className="p-4 border-zinc-700 bg-zinc-900/40">
              <p className="text-xs text-zinc-400 font-medium">Qualified Meetings Booked</p>
              <p className="mono mt-2 text-2xl font-bold text-white">29</p>
              <p className="mt-1 text-[11px] text-emerald-400 font-medium">28 CCW + 1 US Outbound</p>
            </Card>
          </div>

          {/* Clean Initiative Summary Table */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Three-Track Campaign Comparison</h3>
                <p className="text-xs text-zinc-500">High-level distribution of effort and conversion.</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">3 Core Programs</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="pb-3 font-medium">Initiative</th>
                    <th className="pb-3 font-medium">Channels Deployed</th>
                    <th className="pb-3 font-medium text-right">Total Touches</th>
                    <th className="pb-3 font-medium text-right">Replies / Convos</th>
                    <th className="pb-3 font-medium text-right">Meetings Booked</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3 font-medium text-zinc-100 flex items-center gap-2">
                      <Calendar className="size-3.5 text-amber-400" />
                      CCW Las Vegas Outreach (Pre & Post)
                    </td>
                    <td className="py-3 text-zinc-400">Cold Calling + Cold Emailing</td>
                    <td className="py-3 mono text-right text-zinc-200">14,900</td>
                    <td className="py-3 mono text-right text-zinc-200">143 replies</td>
                    <td className="py-3 mono text-right text-emerald-400 font-bold text-sm">28</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setActiveTab("ccw")}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100"
                      >
                        Open CCW <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3 font-medium text-zinc-100 flex items-center gap-2">
                      <Building2 className="size-3.5 text-blue-400" />
                      US Outbound Enterprise Pipeline
                    </td>
                    <td className="py-3 text-zinc-400">Calling + Emailing + LinkedIn Organic</td>
                    <td className="py-3 mono text-right text-zinc-200">4,984</td>
                    <td className="py-3 mono text-right text-zinc-200">146 convos</td>
                    <td className="py-3 mono text-right text-emerald-400 font-bold text-sm">1</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setActiveTab("outbound")}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100"
                      >
                        Open Outbound <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3 font-medium text-zinc-100 flex items-center gap-2">
                      <Swords className="size-3.5 text-rose-400" />
                      Competitive Displacement (Instantly)
                    </td>
                    <td className="py-3 text-zinc-400">Targeted Instantly Email Sequences</td>
                    <td className="py-3 mono text-right text-zinc-200">1,300</td>
                    <td className="py-3 mono text-right text-zinc-200">2% reply</td>
                    <td className="py-3 mono text-right text-zinc-400">0</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setActiveTab("displacement")}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100"
                      >
                        Open Instantly <ArrowRight className="size-3" />
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
          TAB 2: CCW CAMPAIGN (PRE & POST EVENT)
          ========================================================================= */}
      {activeTab === "ccw" && (
        <div className="space-y-6">
          {/* Top Stage Split: Pre-Event vs Post-Event */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pre-Event Card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Stage 1
                  </span>
                  <h3 className="text-base font-semibold text-zinc-100">CCW Pre-Event Outreach</h3>
                  <p className="text-xs text-zinc-500">Pre-booking booth meetings for Las Vegas.</p>
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
                    16 Booth Meetings
                  </div>
                </div>

                <div className="rounded border border-zinc-800/80 bg-zinc-950 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Mail className="size-3 text-zinc-500" /> Cold Emailing
                  </div>
                  <p className="mono text-xl font-semibold text-zinc-100">5,234</p>
                  <p className="text-[11px] text-zinc-500">60% Open Rate • 80 Replies</p>
                  <div className="border-t border-zinc-800 pt-1 text-xs text-emerald-400 font-medium">
                    4 Booth Meetings
                  </div>
                </div>
              </div>
            </Card>

            {/* Post-Event Card */}
            <Card className="p-5 space-y-4 border-zinc-700 bg-zinc-950/60">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400">
                    Stage 2 (Primary)
                  </span>
                  <h3 className="text-base font-semibold text-zinc-100">CCW Post-Event Outreach</h3>
                  <p className="text-xs text-zinc-500">Executive follow-up post Las Vegas.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500">Post-Event Booked</span>
                  <p className="mono text-lg font-bold text-emerald-400">8 Meetings</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-zinc-800/80 bg-zinc-950 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Mail className="size-3 text-zinc-500" /> Cold Emailing
                  </div>
                  <p className="mono text-xl font-semibold text-zinc-100">6,234</p>
                  <p className="text-[11px] text-zinc-500">65% Open Rate • 63 Replies</p>
                  <div className="border-t border-zinc-800 pt-1 text-xs text-emerald-400 font-medium">
                    8 Meetings Booked
                  </div>
                </div>

                <div className="rounded border border-zinc-800/80 bg-zinc-950 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Phone className="size-3 text-zinc-500" /> Cold Calling Cockpit
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

          {/* Post-CCW Content & Copy Section (Dedicated Space) */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Messaging Space
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">Post-CCW Content & Scripts</h3>
                <p className="text-xs text-zinc-500">
                  The exact email follow-ups, openers, and sequences deployed after CCW.
                </p>
              </div>
              <StatusBadge tone="neutral">Ready for your copy</StatusBadge>
            </div>

            <div className="mt-5 rounded border border-dashed border-zinc-800 bg-zinc-950/80 p-8 text-center">
              <FileText className="mx-auto size-7 text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-200">
                Paste your Post-CCW copy here
              </p>
              <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-zinc-500">
                Share your Post-CCW email subject lines, body copy, follow-up cadence, or teleprompter lines. They will be formatted cleanly right here with quick-copy controls.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 3: US OUTBOUND PIPELINE
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
            <Card className="p-4 space-y-3 border-zinc-700 bg-zinc-950/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                  Outbound Emailing
                </span>
                <Mail className="size-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="mono text-2xl font-semibold text-zinc-100">3,244 emails</p>
                <p className="text-xs text-zinc-400 mt-0.5">Delivered to US Ops & CX Leaders</p>
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
                  <span className="text-zinc-500">Conversations Started:</span>
                  <span className="mono text-zinc-200 font-medium">10 conversations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Meetings Booked:</span>
                  <span className="mono text-zinc-400 font-medium">0</span>
                </div>
              </div>
            </Card>
          </div>

          {/* US Outbound Content & Copy Section (Dedicated Space) */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Messaging Space
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">US Outbound Content & Sequences</h3>
                <p className="text-xs text-zinc-500">
                  Email templates, cold calling pitch hooks, and LinkedIn messages used for US enterprise outreach.
                </p>
              </div>
              <StatusBadge tone="neutral">Ready for your copy</StatusBadge>
            </div>

            <div className="mt-5 rounded border border-dashed border-zinc-800 bg-zinc-950/80 p-8 text-center">
              <FileText className="mx-auto size-7 text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-200">
                Paste your US Outbound copy here
              </p>
              <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-zinc-500">
                Share the email sequence, subject lines, phone openers, or LinkedIn message copy used for this campaign.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 4: COMPETITIVE DISPLACEMENT (INSTANTLY)
          ========================================================================= */}
      {activeTab === "displacement" && (
        <div className="space-y-6">
          {/* Instantly Campaign Metric Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  Target Audience
                </span>
                <Users className="size-3.5 text-zinc-400" />
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

          {/* Instantly Displacement Content & Copy Section (Dedicated Space) */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Messaging Space
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Competitive Displacement Sequences (Instantly)
                </h3>
                <p className="text-xs text-zinc-500">
                  The poaching copy, latency/cost friction hooks, and sequence angles sent on Instantly.
                </p>
              </div>
              <StatusBadge tone="neutral">Ready for your copy</StatusBadge>
            </div>

            <div className="mt-5 rounded border border-dashed border-zinc-800 bg-zinc-950/80 p-8 text-center">
              <FileText className="mx-auto size-7 text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-200">
                Paste your Instantly Displacement copy here
              </p>
              <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-zinc-500">
                Share the email steps, subject lines, and poaching angles used in this Instantly campaign.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
