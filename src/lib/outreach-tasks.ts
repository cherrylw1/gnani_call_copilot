export const taskTypes = ["email", "linkedin", "call", "referral", "meeting", "nurture", "research", "cleanup", "general"] as const;
export const taskChannels = ["email", "linkedin", "phone", "internal", "general"] as const;
export const taskStatuses = ["open", "done", "snoozed", "dismissed"] as const;
export const taskPriorities = ["low", "medium", "high"] as const;

export type OutreachTaskType = typeof taskTypes[number];
export type OutreachTaskChannel = typeof taskChannels[number];
export type OutreachTaskStatus = typeof taskStatuses[number];
export type OutreachTaskPriority = typeof taskPriorities[number];

export type OutreachTask = {
  id: string;
  source_call_log_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  source_key: string | null;
  source_kind: "manual" | "call_note" | "data_quality";
  task_type: OutreachTaskType;
  channel: OutreachTaskChannel;
  title: string;
  description: string | null;
  evidence_text: string | null;
  prospect_email: string | null;
  prospect_name: string | null;
  account_name: string | null;
  priority: OutreachTaskPriority;
  status: OutreachTaskStatus;
  due_at: string | null;
  snoozed_until: string | null;
  completed_at: string | null;
  dismissed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

const active = (task: OutreachTask) => task.status === "open" || task.status === "snoozed";
const dueTime = (task: OutreachTask) => task.status === "snoozed" && task.snoozed_until ? task.snoozed_until : task.due_at;

export function buildTaskDashboard(tasks: OutreachTask[], now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
  const today = formatter.format(now);
  const dateKey = (value: string | null) => value ? formatter.format(new Date(value)) : null;
  const activeTasks = tasks.filter(active);
  const overdue = activeTasks.filter((task) => dueTime(task) && dateKey(dueTime(task))! < today);
  const dueToday = activeTasks.filter((task) => dateKey(dueTime(task)) === today);
  const upcoming = activeTasks.filter((task) => dueTime(task) && dateKey(dueTime(task))! > today);
  const unscheduled = activeTasks.filter((task) => !dueTime(task));
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...tasks].sort((a, b) => {
    const aActive = active(a) ? 0 : 1;
    const bActive = active(b) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    const aDue = dueTime(a) ? new Date(dueTime(a)!).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = dueTime(b) ? new Date(dueTime(b)!).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue || priorityOrder[a.priority] - priorityOrder[b.priority] || b.created_at.localeCompare(a.created_at);
  });
  const byType = taskTypes.map((name) => ({ name, count: activeTasks.filter((task) => task.task_type === name).length }));
  const byChannel = taskChannels.map((name) => ({ name, count: activeTasks.filter((task) => task.channel === name).length }));
  const nextSevenDays = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const key = dateKey(date.toISOString())!;
    return { date: key, count: activeTasks.filter((task) => dateKey(dueTime(task)) === key).length };
  });
  return {
    generatedAt: now.toISOString(),
    summary: {
      active: activeTasks.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      upcoming: upcoming.length,
      unscheduled: unscheduled.length,
      highPriority: activeTasks.filter((task) => task.priority === "high").length,
      completed: tasks.filter((task) => task.status === "done").length,
      dismissed: tasks.filter((task) => task.status === "dismissed").length
    },
    byType,
    byChannel,
    nextSevenDays,
    tasks: sorted
  };
}

export type TaskDashboard = ReturnType<typeof buildTaskDashboard>;
