import { Card } from "./ui/card";
export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) { return <Card className="p-4"><p className="text-xs text-zinc-500">{label}</p><p className="mono mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{value}</p>{detail && <p className="mt-2 text-xs text-zinc-500">{detail}</p>}</Card>; }
