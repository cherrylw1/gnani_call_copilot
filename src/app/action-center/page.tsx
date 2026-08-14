import type { Metadata } from "next";
import { ActionCenterDashboard } from "@/components/action-center/action-center-dashboard";

export const metadata: Metadata = { title: "Action Center | gnani", robots: { index: false, follow: false } };

export default function ActionCenterPage() {
  return <ActionCenterDashboard />;
}
