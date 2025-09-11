// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY")!;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const ALLOW_ORIGIN = "https://www.wxmktgameresearch.site"; // 去掉末尾斜杠，避免与 Origin 不一致


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors() });

  try {
    const { prompt, model = "deepseek-chat", max_tokens = 2000, temperature = 0.7 } = await req.json();
    if (!prompt) return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers: corsJson() });

    const resp = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model, messages: [{ role: "user", content: prompt }], max_tokens, temperature, stream: false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: "Upstream error", detail: text }), { status: 502, headers: corsJson() });
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ data }), { status: 200, headers: corsJson() });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Server error", detail: String(e?.message || e) }), { status: 500, headers: corsJson() });
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
function corsJson() { return { "Content-Type": "application/json", ...cors() }; }
