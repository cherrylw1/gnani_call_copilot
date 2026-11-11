export const usOutboundEmailData = {
  totalSent: 3244,
  openRatePct: 58,
  totalReplies: 14,
  meetingsBooked: 1,
  strategy: "Research-driven, account-specific email outreach built around active hiring and telephony signals.",
  sourceLabel: "Breakdown · US Outbound Pipeline"
} as const;

export const usOutboundEmailDataWithDerivedMetrics = {
  ...usOutboundEmailData,
  reportedOpens: Math.round(usOutboundEmailData.totalSent * (usOutboundEmailData.openRatePct / 100)),
  replyRatePct: (usOutboundEmailData.totalReplies / usOutboundEmailData.totalSent) * 100,
  meetingRatePct: (usOutboundEmailData.meetingsBooked / usOutboundEmailData.totalSent) * 100,
  meetingFromReplyRatePct: (usOutboundEmailData.meetingsBooked / usOutboundEmailData.totalReplies) * 100
} as const;

