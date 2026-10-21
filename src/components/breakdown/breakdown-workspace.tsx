"use client";

import { useState } from "react";
import {
  Layers,
  Phone,
  Mail,
  Linkedin,
  Target,
  Swords,
  Calendar,
  FileText,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type TrackFilter = "all" | "ccw" | "displacement";
type ChannelFilter = "all" | "call" | "email" | "linkedin" | "instantly";

export function BreakdownWorkspace() {
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [selectedContentTrack, setSelectedContentTrack] = useState<string | null>("ccw-post-call");

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          title="Campaign & Data Breakdown"
          subtitle="Comprehensive multi-track breakdown across CCW event outreach, US outbound, and competitive displacement campaigns."
        />
        <div className="flex items-center gap-2">
          <StatusBadge tone="good">Structure Ready</StatusBadge>
          <span className="border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
            Awaiting numbers & content
          </span>
        </div>
      </div>

      {/* Primary Track Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTrackFilter("all")}
            className={`focus-ring flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition ${
              trackFilter === "all"
                ? "bg-zinc-100 text-zinc-950"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <Layers className="size-3.5" />
            All Tracks
          </button>
          <button
            onClick={() => setTrackFilter("ccw")}
            className={`focus-ring flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition ${
              trackFilter === "ccw"
                ? "bg-zinc-100 text-zinc-950"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <Calendar className="size-3.5" />
            1. CCW & US Outbound
          </button>
          <button
            onClick={() => setTrackFilter("displacement")}
            className={`focus-ring flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition ${
              trackFilter === "displacement"
                ? "bg-zinc-100 text-zinc-950"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <Swords className="size-3.5" />
            2. Competitive Displacement (Instantly)
          </button>
        </div>

        {/* Channel quick filter */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="mr-1 text-zinc-500">Channel:</span>
          {(
            [
              { id: "all", label: "All" },
              { id: "call", label: "Cold Calling" },
              { id: "email", label: "Cold Emailing" },
              { id: "linkedin", label: "LinkedIn" },
              { id: "instantly", label: "Instantly" }
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setChannelFilter(c.id)}
              className={`px-2 py-0.5 text-[11px] border transition ${
                channelFilter === c.id
                  ? "border-zinc-300 bg-zinc-800 text-zinc-100"
                  : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Aggregate Metric Cards (Placeholders for user numbers) */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Pipeline Aggregate Metrics
          </h2>
          <span className="text-[11px] text-zinc-500">Values will populate from your figures</span>
        </div>
        <div className="grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Total Leads In Scope</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">—</p>
            <p className="mt-1 text-[11px] text-zinc-500">Unique targeted accounts & contacts</p>
          </div>
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Total Outbound Touches</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">—</p>
            <p className="mt-1 text-[11px] text-zinc-500">Calls, emails, & LinkedIn touches</p>
          </div>
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Connect / Open Rate</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">— %</p>
            <p className="mt-1 text-[11px] text-zinc-500">Combined engagement baseline</p>
          </div>
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Reply / Conversation Rate</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">— %</p>
            <p className="mt-1 text-[11px] text-zinc-500">Two-way prospect engagements</p>
          </div>
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Qualified Meetings Booked</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">—</p>
            <p className="mt-1 text-[11px] text-zinc-500">Converted pipeline opportunities</p>
          </div>
        </div>
      </section>

      {/* TRACK 1: CCW & US Outbound Breakdown */}
      {(trackFilter === "all" || trackFilter === "ccw") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
                  1
                </span>
                <h2 className="text-base font-semibold tracking-tight">
                  CCW & US Outbound Campaigns
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Pre-event outreach, post-event cold calling and cold emailing, US outbound, and organic LinkedIn outreach.
              </p>
            </div>
            <StatusBadge tone="neutral">Event & Outbound Track</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Stage A: Pre-Event Outreach */}
            <Card className="flex flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Stage 1
                  </span>
                  <div className="flex gap-1 text-zinc-400">
                    <Phone className="size-3.5" />
                    <Mail className="size-3.5" />
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                  CCW Pre-Event Outreach
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Pre-conference touchpoints to pre-book executive booth meetings in Las Vegas.
                </p>

                <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Cold Calling:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Cold Emailing:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Total Leads Dialed / Emailed:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Pre-Booked Meetings:</span>
                    <span className="mono text-zinc-100 font-semibold">—</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-800/80 pt-3">
                <button
                  onClick={() => setSelectedContentTrack("ccw-pre")}
                  className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                >
                  <span>View Pre-Event Content</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </Card>

            {/* Stage B: Post-Event Outreach */}
            <Card className="flex flex-col justify-between p-4 border-zinc-700 bg-zinc-950/70">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    Stage 2 (Primary)
                  </span>
                  <div className="flex gap-1 text-zinc-400">
                    <Phone className="size-3.5" />
                    <Mail className="size-3.5" />
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                  CCW Post-Event Outreach
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Direct follow-up referencing sovereign Voice AI models showcased at CCW Las Vegas.
                </p>

                <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Cold Calling Touches:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Cold Email Touches:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Connects / Open Rate:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Post-Event Meetings Booked:</span>
                    <span className="mono text-zinc-100 font-semibold">—</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-800/80 pt-3">
                <button
                  onClick={() => setSelectedContentTrack("ccw-post-call")}
                  className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                >
                  <span>View Post-Event Content</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </Card>

            {/* Stage C: US Outbound */}
            <Card className="flex flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    US Cold Engine
                  </span>
                  <div className="flex gap-1 text-zinc-400">
                    <Phone className="size-3.5" />
                    <Mail className="size-3.5" />
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                  US Outbound (Calling & Emailing)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Targeted enterprise contact-center outreach across high-volume US vertical accounts.
                </p>

                <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Accounts Targeted:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Calling Touches:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Email Touches:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Pipeline Generated:</span>
                    <span className="mono text-zinc-100 font-semibold">—</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-800/80 pt-3">
                <button
                  onClick={() => setSelectedContentTrack("us-outbound")}
                  className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                >
                  <span>View US Outbound Content</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </Card>

            {/* Stage D: LinkedIn Organic Outreach */}
            <Card className="flex flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Social Channel
                  </span>
                  <Linkedin className="size-3.5 text-zinc-400" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                  LinkedIn Organic Outreach
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Executive peer-to-peer connection notes, content drops, and direct InMail messaging.
                </p>

                <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Connections Sent:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Acceptance Rate:</span>
                    <span className="mono text-zinc-300 font-medium">— %</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Conversations Started:</span>
                    <span className="mono text-zinc-300 font-medium">—</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Meetings Booked:</span>
                    <span className="mono text-zinc-100 font-semibold">—</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-800/80 pt-3">
                <button
                  onClick={() => setSelectedContentTrack("linkedin")}
                  className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                >
                  <span>View LinkedIn Content</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* TRACK 2: Competitive Displacement (Instantly) */}
      {(trackFilter === "all" || trackFilter === "displacement") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
                  2
                </span>
                <h2 className="text-base font-semibold tracking-tight">
                  Competitive Displacement Campaign (Instantly)
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Email campaign executed on Instantly targeted specifically at prospects already running incumbent Voice AI solutions.
              </p>
            </div>
            <StatusBadge tone="warn">Instantly Email Campaign</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Campaign Focus</span>
                <Target className="size-3.5 text-zinc-400" />
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                Competitor User Targeting
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Identified companies already utilizing competing voice AI or chatbot solutions.
              </p>
              <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Platform:</span>
                  <span className="text-zinc-200 font-medium">Instantly.ai</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Strategy:</span>
                  <span className="text-zinc-200 font-medium">Poach & Displace</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Enrolled:</span>
                  <span className="mono text-zinc-100 font-medium">—</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Deliverability & Opens</span>
                <Mail className="size-3.5 text-zinc-400" />
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                Instantly Sending Performance
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Warmup, inbox placement, and step sequence engagement.
              </p>
              <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Delivered:</span>
                  <span className="mono text-zinc-300 font-medium">—</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Open Rate:</span>
                  <span className="mono text-zinc-300 font-medium">— %</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sequence Steps:</span>
                  <span className="mono text-zinc-200 font-medium">— steps</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Conversion & Migration</span>
                <ArrowUpRight className="size-3.5 text-zinc-400" />
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                Replies & Meetings Converted
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Prospects expressing latency frustration, high pricing, or open to evaluating Gnani.
              </p>
              <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reply Rate:</span>
                  <span className="mono text-zinc-300 font-medium">— %</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Positive Interest Replies:</span>
                  <span className="mono text-zinc-300 font-medium">—</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Displacement Demos:</span>
                  <span className="mono text-zinc-100 font-semibold">—</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* CAMPAIGN CONTENT & MESSAGING VAULT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Content & Messaging Used
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Exact scripts, email sequences, objection angles, and copy deployed for each initiative.
            </p>
          </div>
          <span className="text-xs text-zinc-500">Ready for template copy</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Track selector list */}
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Select Campaign Track
            </p>
            {[
              { id: "ccw-post-call", label: "CCW Post-Event: Cold Calling", channel: "Phone" },
              { id: "ccw-post-email", label: "CCW Post-Event: Cold Emailing", channel: "Email" },
              { id: "ccw-pre", label: "CCW Pre-Event: Booth Outreach", channel: "Phone/Email" },
              { id: "us-outbound", label: "US Outbound: Enterprise Sequence", channel: "Calling/Email" },
              { id: "linkedin", label: "LinkedIn: Organic Peer Messaging", channel: "LinkedIn" },
              { id: "instantly-displacement", label: "Instantly: Competitor Displacement", channel: "Instantly Email" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedContentTrack(item.id)}
                className={`focus-ring flex w-full items-center justify-between px-3 py-2 text-left text-xs transition ${
                  selectedContentTrack === item.id
                    ? "border-l-2 border-white bg-zinc-900 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-zinc-500">{item.channel}</span>
              </button>
            ))}
          </div>

          {/* Content display pane (Clean layout ready for user copy) */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Active Content Workspace
                </span>
                <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                  {selectedContentTrack === "ccw-post-call" && "CCW Post-Event Cold Calling Scripts"}
                  {selectedContentTrack === "ccw-post-email" && "CCW Post-Event Cold Email Follow-Up Sequences"}
                  {selectedContentTrack === "ccw-pre" && "CCW Pre-Event Las Vegas Meeting Invitation"}
                  {selectedContentTrack === "us-outbound" && "US Outbound Enterprise Cold Scripts & Email"}
                  {selectedContentTrack === "linkedin" && "LinkedIn Organic Outreach & InMail Messaging"}
                  {selectedContentTrack === "instantly-displacement" && "Instantly Competitor Poaching / Displacement Sequences"}
                </h3>
              </div>
              <StatusBadge tone="neutral">Content Slot</StatusBadge>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
                <FileText className="mx-auto size-6 text-zinc-600" />
                <p className="mt-2 text-sm font-medium text-zinc-300">
                  Content and messaging space ready
                </p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
                  When you share the exact email copy, phone openers, subject lines, or follow-up cadences used for this track, they will be formatted here with quick-copy controls and step breakdown.
                </p>
              </div>

              {/* Placeholder slots for structure preview */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Primary Subject Line / Hook</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Pending content input] —</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Core Value Proposition / Offer</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Pending content input] —</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Call to Action (CTA)</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Pending content input] —</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Follow-up Angle / Bump</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Pending content input] —</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* DETAILED DATA BREAKDOWN TABLE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Granular Campaign Data Table
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Itemized breakdown across campaigns, audiences, volume numbers, and performance.
            </p>
          </div>
          <span className="text-xs text-zinc-500">Columns configured</span>
        </div>

        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full min-w-[960px] border-collapse text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
              <tr>
                <th className="p-3 font-medium">Campaign Track</th>
                <th className="p-3 font-medium">Stage / Channel</th>
                <th className="p-3 font-medium">Target Audience</th>
                <th className="p-3 font-medium">Total Targeted</th>
                <th className="p-3 font-medium">Delivered / Dialed</th>
                <th className="p-3 font-medium">Connect / Open %</th>
                <th className="p-3 font-medium">Replies / Convos</th>
                <th className="p-3 font-medium">Meetings Booked</th>
                <th className="p-3 font-medium">Content Asset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950 text-zinc-300">
              {/* Row 1 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">CCW Pre-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Phone className="size-3" /> Cold Calling
                  </span>
                </td>
                <td className="p-3 text-zinc-400">Pre-Registered CCW Attendees</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">CCW Pre-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Mail className="size-3" /> Cold Emailing
                  </span>
                </td>
                <td className="p-3 text-zinc-400">Pre-Registered CCW Attendees</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">CCW Post-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Phone className="size-3" /> Cold Calling
                  </span>
                </td>
                <td className="p-3 text-zinc-400">CCW Master Leads (6 Personas)</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
              {/* Row 4 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">CCW Post-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Mail className="size-3" /> Cold Emailing
                  </span>
                </td>
                <td className="p-3 text-zinc-400">CCW Lead Pipeline</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
              {/* Row 5 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">US Outbound</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Phone className="size-3" /> Cold Calling
                  </span>
                </td>
                <td className="p-3 text-zinc-400">US Contact Centers & Ops</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
              {/* Row 6 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">US Outbound</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Mail className="size-3" /> Cold Emailing
                  </span>
                </td>
                <td className="p-3 text-zinc-400">US Enterprise Accounts</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
              {/* Row 7 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">US Outbound</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Linkedin className="size-3" /> LinkedIn Organic
                  </span>
                </td>
                <td className="p-3 text-zinc-400">VP & Director Operations / CX</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
              {/* Row 8 */}
              <tr className="border-t-2 border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">Competitive Displacement</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-300">
                    <Swords className="size-3 text-amber-400" /> Instantly Email
                  </span>
                </td>
                <td className="p-3 text-zinc-400">Active Incumbent Voice AI Users</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-400">— %</td>
                <td className="p-3 mono text-zinc-400">—</td>
                <td className="p-3 mono text-zinc-100 font-semibold">—</td>
                <td className="p-3 text-zinc-500 text-[11px]">Pending copy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
