import "server-only";

type RouterResult<T> = { data: T; model: string };

type RouterTextResult = { text: string; model: string };

async function openRouterTextAttempt(model: string, prompt: string, maxTokens: number) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OpenRouter is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OPENROUTER_TIMEOUT_MS || 45_000));
  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }]
      })
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}).`);
  const body = await response.json() as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter returned no text.");
  return text;
}

export async function openRouterText(prompt: string, maxTokens: number): Promise<RouterTextResult> {
  const primary = process.env.OPENROUTER_MODEL;
  const fallback = process.env.OPENROUTER_FALLBACK_MODEL;
  if (!primary || !fallback) throw new Error("OpenRouter is not configured.");
  try {
    return { text: await openRouterTextAttempt(primary, prompt, maxTokens), model: primary };
  } catch {
    return { text: await openRouterTextAttempt(fallback, prompt, maxTokens), model: fallback };
  }
}

export async function openRouterJson<T>(prompt: string, maxTokens: number): Promise<RouterResult<T>> {
  const key = process.env.OPENROUTER_API_KEY; const primary = process.env.OPENROUTER_MODEL; const fallback = process.env.OPENROUTER_FALLBACK_MODEL;
  if (!key || !primary || !fallback) throw new Error("OpenRouter is not configured.");
  const call = async (model: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.OPENROUTER_TIMEOUT_MS || 45_000));
    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", signal: controller.signal, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, temperature: 0.25, max_tokens: maxTokens, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }) });
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}).`);
    const body = await response.json() as { choices?: { message?: { content?: string } }[] }; const content = body.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned no content."); return JSON.parse(content) as T;
  };
  try { return { data: await call(primary), model: primary }; } catch { return { data: await call(fallback), model: fallback }; }
}
