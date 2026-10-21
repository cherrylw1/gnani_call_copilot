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
  ArrowUpRight,
  Users,
  CheckCircle2
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type TrackFilter = "all" | "ccw" | "displacement";
type ChannelFilter = "all" | "call" | "email" | "linkedin" | "instantly";

export function BreakdownWorkspace() {
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [selectedContentTrack, setSelectedContentTrack] = useState<string>("ccw-pre-call");

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          title="Campaign & Data Breakdown"
          subtitle="Consolidated performance across CCW Las Vegas outreach, US enterprise outbound, and Instantly competitive displacement."
        />
        <div className="flex items-center gap-2">
          <StatusBadge tone="good">Verified Campaign Data</StatusBadge>
          <span className="border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300">
            29 Meetings Booked Total
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
            All Tracks (5 Campaigns)
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
              { id: "all", label: "All Channels" },
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

      {/* Executive Aggregate Metric Cards */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Pipeline Aggregate Metrics Across All Campaigns
          </h2>
          <span className="text-[11px] text-zinc-500">Live verified figures</span>
        </div>
        <div className="grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Total Outbound Touches</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">21,184+</p>
            <p className="mt-1 text-[11px] text-zinc-500">Dials, emails, InMails, & Instantly</p>
          </div>
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Total Emails Sent / Delivered</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">16,012</p>
            <p className="mt-1 text-[11px] text-zinc-500">Across CCW, US outbound, & Instantly</p>
          </div>
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Total Cold Dials Made</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">4,972+</p>
            <p className="mt-1 text-[11px] text-zinc-500">3,432 pre-CCW + 1,540 US cold</p>
          </div>
          <div className="bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">Direct Replies & Convos</p>
            <p className="mono mt-2 text-2xl font-semibold text-zinc-100">291</p>
            <p className="mt-1 text-[11px] text-zinc-500">159 email replies + 132 live calls</p>
          </div>
          <div className="bg-zinc-950 p-4 border-l border-zinc-700/60">
            <p className="text-xs text-zinc-400 font-medium">Qualified Meetings Booked</p>
            <p className="mono mt-2 text-2xl font-bold text-white">29</p>
            <p className="mt-1 text-[11px] text-emerald-400">28 CCW + 1 US Outbound</p>
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
            {(channelFilter === "all" || channelFilter === "call" || channelFilter === "email") && (
              <Card className="flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Track 1
                    </span>
                    <div className="flex gap-1.5 text-zinc-400">
                      <Phone className="size-3.5" />
                      <Mail className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                    CCW Pre-Event Outreach
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    Pre-conference outreach to pre-book executive booth meetings in Las Vegas.
                  </p>

                  <div className="mt-4 space-y-2.5 border-t border-zinc-800 pt-3">
                    <div className="rounded bg-zinc-900/60 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Phone className="size-3" /> Calling Dials:
                        </span>
                        <span className="mono text-zinc-100 font-semibold">3,432</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Pre-Booked Calls:</span>
                        <span className="mono text-emerald-400 font-semibold">16 meetings</span>
                      </div>
                    </div>

                    <div className="rounded bg-zinc-900/60 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Mail className="size-3" /> Emails Delivered:
                        </span>
                        <span className="mono text-zinc-100 font-semibold">5,234</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Open Rate:</span>
                        <span className="mono text-zinc-300">60% (~3,140 opens)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Total Replies:</span>
                        <span className="mono text-zinc-200 font-medium">80 replies</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Pre-Booked Email:</span>
                        <span className="mono text-emerald-400 font-semibold">4 meetings</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-xs">
                      <span className="text-zinc-400 font-medium">Total Pre-Booked:</span>
                      <span className="mono text-emerald-400 font-bold text-sm">20 Meetings</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800/80 pt-3">
                  <button
                    onClick={() => setSelectedContentTrack("ccw-pre-call")}
                    className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                  >
                    <span>View Pre-Event Hooks</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </Card>
            )}

            {/* Stage B: Post-Event Outreach */}
            {(channelFilter === "all" || channelFilter === "call" || channelFilter === "email") && (
              <Card className="flex flex-col justify-between p-4 border-zinc-700 bg-zinc-950/70">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      Track 2 (Primary)
                    </span>
                    <div className="flex gap-1.5 text-zinc-400">
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

                  <div className="mt-4 space-y-2.5 border-t border-zinc-800 pt-3">
                    <div className="rounded bg-zinc-900/60 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Mail className="size-3" /> Emails Delivered:
                        </span>
                        <span className="mono text-zinc-100 font-semibold">6,234</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Open Rate:</span>
                        <span className="mono text-zinc-300">65% (~4,052 opens)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Total Replies:</span>
                        <span className="mono text-zinc-200 font-medium">63 replies</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Email Meetings Booked:</span>
                        <span className="mono text-emerald-400 font-semibold">8 meetings</span>
                      </div>
                    </div>

                    <div className="rounded bg-zinc-900/60 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Phone className="size-3" /> Calling Pipeline:
                        </span>
                        <span className="mono text-zinc-200 font-medium">1,673 Leads</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Persona Segments:</span>
                        <span className="mono text-zinc-300">6 Executive Segments</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Calling Script:</span>
                        <span className="mono text-zinc-300">Sovereign Voice Teleprompter</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-xs">
                      <span className="text-zinc-400 font-medium">Post-Event Email Booked:</span>
                      <span className="mono text-emerald-400 font-bold text-sm">8 Meetings</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800/80 pt-3">
                  <button
                    onClick={() => setSelectedContentTrack("ccw-post-email")}
                    className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                  >
                    <span>View Post-Event Email Copy</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </Card>
            )}

            {/* Stage C: US Outbound */}
            {(channelFilter === "all" || channelFilter === "call" || channelFilter === "email") && (
              <Card className="flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Track 3
                    </span>
                    <div className="flex gap-1.5 text-zinc-400">
                      <Phone className="size-3.5" />
                      <Mail className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                    US Outbound (Calling & Emailing)
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    Targeted outreach across high-volume US vertical enterprise accounts.
                  </p>

                  <div className="mt-4 space-y-2.5 border-t border-zinc-800 pt-3">
                    <div className="rounded bg-zinc-900/60 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Users className="size-3" /> Target Universe:
                        </span>
                        <span className="mono text-zinc-100 font-semibold">203 Accounts</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Calling Dials:</span>
                        <span className="mono text-zinc-200 font-medium">1,540 dials</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Calls Connected:</span>
                        <span className="mono text-zinc-200 font-medium">122 (7.9% connect)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Calling Meetings:</span>
                        <span className="mono text-zinc-400 font-medium">0</span>
                      </div>
                    </div>

                    <div className="rounded bg-zinc-900/60 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Mail className="size-3" /> Emails Delivered:
                        </span>
                        <span className="mono text-zinc-100 font-semibold">3,244</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Open Rate:</span>
                        <span className="mono text-zinc-300">58% (~1,882 opens)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Replies:</span>
                        <span className="mono text-zinc-200 font-medium">14 replies</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 pl-4">Email Meetings Booked:</span>
                        <span className="mono text-emerald-400 font-semibold">1 meeting</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-xs">
                      <span className="text-zinc-400 font-medium">US Outbound Booked:</span>
                      <span className="mono text-emerald-400 font-bold text-sm">1 Meeting</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800/80 pt-3">
                  <button
                    onClick={() => setSelectedContentTrack("us-outbound-calling")}
                    className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                  >
                    <span>View US Outbound Content</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </Card>
            )}

            {/* Stage D: LinkedIn Organic Outreach */}
            {(channelFilter === "all" || channelFilter === "linkedin") && (
              <Card className="flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Track 4
                    </span>
                    <Linkedin className="size-3.5 text-zinc-400" />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                    LinkedIn Organic Outreach
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    Executive peer-to-peer connection requests, direct messaging, and relationship building.
                  </p>

                  <div className="mt-4 space-y-2.5 border-t border-zinc-800 pt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Connection Requests Sent:</span>
                      <span className="mono text-zinc-100 font-semibold">200</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Connections Accepted:</span>
                      <span className="mono text-zinc-200 font-medium">4 (2.0% accept)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Active Conversations Started:</span>
                      <span className="mono text-zinc-200 font-medium">10 conversations</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">InMails / Direct Messages:</span>
                      <span className="mono text-zinc-400">—</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-xs">
                      <span className="text-zinc-400 font-medium">Meetings Booked:</span>
                      <span className="mono text-zinc-400 font-medium">0</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800/80 pt-3">
                  <button
                    onClick={() => setSelectedContentTrack("linkedin")}
                    className="inline-flex w-full items-center justify-between text-xs text-zinc-400 transition hover:text-zinc-100"
                  >
                    <span>View LinkedIn Notes</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* TRACK 2: Competitive Displacement (Instantly) */}
      {(trackFilter === "all" || trackFilter === "displacement") && (channelFilter === "all" || channelFilter === "instantly" || channelFilter === "email") && (
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
                Cold email campaign run on Instantly targeting accounts already working with incumbent Voice AI solutions.
              </p>
            </div>
            <StatusBadge tone="warn">Track 5: Instantly</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Audience & Enrolled</span>
                <Target className="size-3.5 text-zinc-400" />
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                Voice AI User Targeting
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Companies identified with incumbent voice automation or chatbot deployments.
              </p>
              <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sending Platform:</span>
                  <span className="text-zinc-200 font-medium">Instantly.ai</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Leads Enrolled:</span>
                  <span className="mono text-zinc-100 font-semibold">312 leads</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target Strategy:</span>
                  <span className="text-zinc-300 font-medium">Poach & Displace</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Sending & Deliverability</span>
                <Mail className="size-3.5 text-zinc-400" />
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                Instantly Email Volume
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Cold email sequence dispatch across enterprise target contacts.
              </p>
              <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Delivered:</span>
                  <span className="mono text-zinc-100 font-semibold">1,300 emails</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Average Sends/Lead:</span>
                  <span className="mono text-zinc-300 font-medium">~4.1 touches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Campaign Status:</span>
                  <span className="text-zinc-300 font-medium">Completed run</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Engagement & Pipeline</span>
                <ArrowUpRight className="size-3.5 text-zinc-400" />
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                Replies & Conversion
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Displacement reply engagement and migration conversation tracking.
              </p>
              <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reply Rate:</span>
                  <span className="mono text-zinc-200 font-semibold">2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Positive / Interested Replies:</span>
                  <span className="mono text-zinc-400 font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Displacement Demos Booked:</span>
                  <span className="mono text-zinc-400 font-medium">0</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* DETAILED DATA BREAKDOWN TABLE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Granular Campaign Data Table
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Direct side-by-side comparison across all 5 campaign tracks and channels.
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">5 Tracks • 29 Total Booked</span>
        </div>

        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full min-w-[960px] border-collapse text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
              <tr>
                <th className="p-3 font-medium">Track # / Campaign</th>
                <th className="p-3 font-medium">Channel</th>
                <th className="p-3 font-medium">Target Scope</th>
                <th className="p-3 font-medium text-right">Dials / Sent</th>
                <th className="p-3 font-medium text-right">Connect / Open %</th>
                <th className="p-3 font-medium text-right">Replies / Convos</th>
                <th className="p-3 font-medium text-right">Meetings Booked</th>
                <th className="p-3 font-medium">Outcome Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950 text-zinc-300">
              {/* Row 1 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">Track 1: CCW Pre-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Phone className="size-3 text-zinc-400" /> Cold Calling
                  </span>
                </td>
                <td className="p-3 text-zinc-400">CCW Las Vegas Pre-Registered Attendees</td>
                <td className="p-3 mono text-right text-zinc-100 font-semibold">3,432</td>
                <td className="p-3 mono text-right text-zinc-400">—</td>
                <td className="p-3 mono text-right text-zinc-400">—</td>
                <td className="p-3 mono text-right text-emerald-400 font-bold text-sm">16</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="size-3" /> 16 Pre-Booked Booth Meetings
                  </span>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">Track 1: CCW Pre-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Mail className="size-3 text-zinc-400" /> Cold Emailing
                  </span>
                </td>
                <td className="p-3 text-zinc-400">CCW Las Vegas Pre-Registered Attendees</td>
                <td className="p-3 mono text-right text-zinc-100 font-semibold">5,234</td>
                <td className="p-3 mono text-right text-zinc-200">60%</td>
                <td className="p-3 mono text-right text-zinc-100 font-medium">80 replies</td>
                <td className="p-3 mono text-right text-emerald-400 font-bold text-sm">4</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-zinc-300 text-[11px]">
                    <CheckCircle2 className="size-3 text-emerald-400" /> 80 Replies Logged
                  </span>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-zinc-900/40 bg-zinc-900/20">
                <td className="p-3 font-medium text-zinc-100">Track 2: CCW Post-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Mail className="size-3 text-zinc-400" /> Cold Emailing
                  </span>
                </td>
                <td className="p-3 text-zinc-400">CCW Master Leads (Post-Event List)</td>
                <td className="p-3 mono text-right text-zinc-100 font-semibold">6,234</td>
                <td className="p-3 mono text-right text-emerald-400 font-medium">65%</td>
                <td className="p-3 mono text-right text-zinc-100 font-medium">63 replies</td>
                <td className="p-3 mono text-right text-emerald-400 font-bold text-sm">8</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="size-3" /> 8 Meetings Booked
                  </span>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-zinc-900/40 bg-zinc-900/20">
                <td className="p-3 font-medium text-zinc-100">Track 2: CCW Post-Event</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Phone className="size-3 text-zinc-400" /> Cold Calling
                  </span>
                </td>
                <td className="p-3 text-zinc-400">CCW Assigned Leads (6 Personas)</td>
                <td className="p-3 mono text-right text-zinc-300 font-medium">1,673 leads</td>
                <td className="p-3 mono text-right text-zinc-400">—</td>
                <td className="p-3 mono text-right text-zinc-400">—</td>
                <td className="p-3 mono text-right text-zinc-400">—</td>
                <td className="p-3 text-zinc-400 text-[11px]">Active Dialing Cockpit</td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">Track 3: US Outbound</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Phone className="size-3 text-zinc-400" /> Cold Calling
                  </span>
                </td>
                <td className="p-3 text-zinc-400">203 US Enterprise Target Accounts</td>
                <td className="p-3 mono text-right text-zinc-100 font-semibold">1,540 dials</td>
                <td className="p-3 mono text-right text-zinc-300">7.9%</td>
                <td className="p-3 mono text-right text-zinc-100 font-medium">122 convos</td>
                <td className="p-3 mono text-right text-zinc-400">0</td>
                <td className="p-3 text-zinc-500 text-[11px]">122 live conversations</td>
              </tr>

              {/* Row 6 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">Track 3: US Outbound</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Mail className="size-3 text-zinc-400" /> Cold Emailing
                  </span>
                </td>
                <td className="p-3 text-zinc-400">US Contact Center & CX Leaders</td>
                <td className="p-3 mono text-right text-zinc-100 font-semibold">3,244</td>
                <td className="p-3 mono text-right text-zinc-300">58%</td>
                <td className="p-3 mono text-right text-zinc-100 font-medium">14 replies</td>
                <td className="p-3 mono text-right text-emerald-400 font-bold text-sm">1</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="size-3" /> 1 Meeting Converted
                  </span>
                </td>
              </tr>

              {/* Row 7 */}
              <tr className="hover:bg-zinc-900/40">
                <td className="p-3 font-medium text-zinc-100">Track 4: LinkedIn Organic</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Linkedin className="size-3 text-zinc-400" /> Organic Social
                  </span>
                </td>
                <td className="p-3 text-zinc-400">US Enterprise Operations & CX Leaders</td>
                <td className="p-3 mono text-right text-zinc-100 font-semibold">200 requests</td>
                <td className="p-3 mono text-right text-zinc-300">2.0% (4 acc.)</td>
                <td className="p-3 mono text-right text-zinc-100 font-medium">10 convos</td>
                <td className="p-3 mono text-right text-zinc-400">0</td>
                <td className="p-3 text-zinc-500 text-[11px]">10 conversations</td>
              </tr>

              {/* Row 8 */}
              <tr className="border-t-2 border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50">
                <td className="p-3 font-medium text-zinc-100">Track 5: Displacement</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-amber-300">
                    <Swords className="size-3 text-amber-400" /> Instantly Email
                  </span>
                </td>
                <td className="p-3 text-zinc-400">312 Enrolled Incumbent Voice AI Accounts</td>
                <td className="p-3 mono text-right text-zinc-100 font-semibold">1,300</td>
                <td className="p-3 mono text-right text-zinc-500">—</td>
                <td className="p-3 mono text-right text-zinc-200">2% reply rate</td>
                <td className="p-3 mono text-right text-zinc-400">0</td>
                <td className="p-3 text-zinc-500 text-[11px]">0 positive interest</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CAMPAIGN CONTENT & MESSAGING VAULT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Content & Messaging Used
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Select any campaign below to view or add the exact copy, sequences, and hooks deployed.
            </p>
          </div>
          <span className="text-xs text-zinc-500">Ready for template text</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Track selector list */}
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Select Campaign Track
            </p>
            {[
              { id: "ccw-pre-call", label: "Track 1A: CCW Pre-Event Calling", meta: "16 Meetings Booked" },
              { id: "ccw-pre-email", label: "Track 1B: CCW Pre-Event Email", meta: "60% Open • 80 Replies" },
              { id: "ccw-post-email", label: "Track 2A: CCW Post-Event Email", meta: "65% Open • 8 Meetings" },
              { id: "ccw-post-call", label: "Track 2B: CCW Post-Event Calling", meta: "1,673 Leads in Pipeline" },
              { id: "us-outbound-calling", label: "Track 3A: US Outbound Calling", meta: "1,540 Dials • 122 Convos" },
              { id: "us-outbound-email", label: "Track 3B: US Outbound Email", meta: "58% Open • 1 Meeting" },
              { id: "linkedin", label: "Track 4: LinkedIn Organic", meta: "200 Sent • 10 Convos" },
              { id: "instantly-displacement", label: "Track 5: Instantly Displacement", meta: "1,300 Delivered • 2% Reply" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedContentTrack(item.id)}
                className={`focus-ring flex w-full flex-col px-3 py-2 text-left text-xs transition ${
                  selectedContentTrack === item.id
                    ? "border-l-2 border-white bg-zinc-900 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">{item.meta}</span>
              </button>
            ))}
          </div>

          {/* Content display pane */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Active Content Workspace
                </span>
                <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                  {selectedContentTrack === "ccw-pre-call" && "CCW Pre-Event Cold Calling (16 Meetings Booked)"}
                  {selectedContentTrack === "ccw-pre-email" && "CCW Pre-Event Cold Emailing (80 Replies • 4 Meetings)"}
                  {selectedContentTrack === "ccw-post-email" && "CCW Post-Event Cold Email Sequence (65% Open • 8 Meetings)"}
                  {selectedContentTrack === "ccw-post-call" && "CCW Post-Event Cold Calling Scripts (1,673 Leads)"}
                  {selectedContentTrack === "us-outbound-calling" && "US Outbound Cold Calling (1,540 Dials • 122 Convos)"}
                  {selectedContentTrack === "us-outbound-email" && "US Outbound Cold Email Sequence (14 Replies • 1 Meeting)"}
                  {selectedContentTrack === "linkedin" && "LinkedIn Organic Peer Outreach (10 Active Convos)"}
                  {selectedContentTrack === "instantly-displacement" && "Instantly Competitor Displacement Email Sequence"}
                </h3>
              </div>
              <StatusBadge tone="neutral">Ready for Copy</StatusBadge>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
                <FileText className="mx-auto size-6 text-zinc-600" />
                <p className="mt-2 text-sm font-medium text-zinc-300">
                  Ready to store content for this track
                </p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
                  Whenever you would like to paste the exact subject lines, email templates, or phone scripts used for this track, we will display them here with quick-copy functionality.
                </p>
              </div>

              {/* Placeholder slots for structure preview */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Primary Subject Line / Hook</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Ready for your copy] —</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Core Value Proposition / Angle</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Ready for your copy] —</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Call to Action (CTA)</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Ready for your copy] —</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Follow-Up Cadence</p>
                  <p className="mt-1 text-xs text-zinc-400 italic">— [Ready for your copy] —</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
