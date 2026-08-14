import type { Metadata } from "next";
import { PlanningCenterDashboard } from "@/components/planning/planning-center-dashboard";

export const metadata: Metadata = { title: "Planning Center | gnani", robots: { index: false, follow: false } };

export default function PlanningCenterPage() {
  return <PlanningCenterDashboard />;
}
