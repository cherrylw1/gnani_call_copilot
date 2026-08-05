import "server-only";

type RouterResult<T> = { data: T; model: string };
export async function openRouterJson<T>(prompt: string, maxTokens: number): Promise<RouterResult<T>> {
  const key = process.env.OPENROUTER_API_KEY; const primary = process.env.OPENROUTER_MODEL; const fallback = process.env.OPENROUTER_FALLBACK_MODEL;
  if (!key || !primary || !fallback) throw new Error("OpenRouter is not configured.");
  const call = async (model: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, temperature: 0.35, max_tokens: maxTokens, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }) });
    if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}).`);
    const body = await response.json() as { choices?: { message?: { content?: string } }[] }; const content = body.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned no content."); return JSON.parse(content) as T;
  };
  try { return { data: await call(primary), model: primary }; } catch { return { data: await call(fallback), model: fallback }; }
}
