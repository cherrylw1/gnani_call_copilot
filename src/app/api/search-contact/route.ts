import { NextResponse } from "next/server";
import { z } from "zod";
import { getContactContext } from "@/lib/contact-context";
export async function GET(request: Request) {
  try { const email = z.string().email().parse(new URL(request.url).searchParams.get("email")); const context = await getContactContext(email); return NextResponse.json({ context }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Search failed." }, { status: 400 }); }
}
