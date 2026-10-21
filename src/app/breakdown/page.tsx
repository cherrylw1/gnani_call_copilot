import type { Metadata } from "next";
import { BreakdownWorkspace } from "@/components/breakdown/breakdown-workspace";

export const metadata: Metadata = {
  title: "Campaign & Data Breakdown | gnani",
  robots: { index: false, follow: false }
};

export default function BreakdownPage() {
  return <BreakdownWorkspace />;
}
