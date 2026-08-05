import { Inbox } from "lucide-react";
export function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="border border-dashed border-zinc-700 p-8 text-center"><Inbox className="mx-auto mb-3 size-5 text-zinc-500" /><p className="font-medium">{title}</p><p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">{detail}</p></div>; }
