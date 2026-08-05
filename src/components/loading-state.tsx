export function LoadingState({ label = "Loading" }: { label?: string }) { return <div className="animate-pulse border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500">{label}...</div>; }
