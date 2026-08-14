import type { Metadata } from "next";
import { ConversationInsightsDashboard } from "@/components/conversation-insights/conversation-insights-dashboard";

export const metadata: Metadata = { title: "Conversation Insights | gnani", robots: { index: false, follow: false } };

export default function ConversationInsightsPage() {
  return <ConversationInsightsDashboard />;
}
