import type { Metadata } from "next";
import { CallReportDashboard } from "@/components/call-report/call-report-dashboard";

export const metadata: Metadata = { title: "Call Activity Report | gnani", robots: { index: false, follow: false } };

export default function CallReportPage() {
  return <CallReportDashboard />;
}
