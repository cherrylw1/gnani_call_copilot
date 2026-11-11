import type { Metadata } from "next";
import { OutreachSummaryPage } from "@/components/outreach-summary/outreach-summary-page";
import { internationalOutreachData } from "@/lib/international-outreach-data";

export const metadata: Metadata = { title: "Executive Activity Summary | gnani", robots: { index: false, follow: false } };

export default function OutreachSummaryRoute() {
  return <OutreachSummaryPage data={internationalOutreachData} />;
}
