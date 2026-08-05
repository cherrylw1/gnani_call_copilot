import type { HTMLAttributes } from "react";
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <section className={`border border-zinc-800 bg-zinc-950 ${className}`} {...props} />; }
