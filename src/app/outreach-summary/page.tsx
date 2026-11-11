import type { Metadata } from "next";
import { OutreachSummaryPage } from "@/components/outreach-summary/outreach-summary-page";

export const metadata: Metadata = { title: "Executive Activity Summary | gnani", robots: { index: false, follow: false } };

export default function OutreachSummaryRoute() {
  return <OutreachSummaryPage />;
}
