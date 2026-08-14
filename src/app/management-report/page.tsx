import type { Metadata } from "next";
import { ManagementReportDashboard } from "@/components/management-report/management-report-dashboard";

export const metadata: Metadata = { title: "Management Call Report | gnani", robots: { index: false, follow: false } };

export default function ManagementReportPage() {
  return <ManagementReportDashboard />;
}
