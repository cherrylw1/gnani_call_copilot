import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
export function AppShell({ children }: { children: ReactNode }) { return <div className="app-shell min-h-[100dvh] bg-zinc-950 text-zinc-100 lg:flex"><Sidebar /><div className="min-w-0 flex-1"><Topbar /><main className="app-main mx-auto max-w-[1600px] p-4 md:p-7">{children}</main></div></div>; }
