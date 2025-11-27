// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY"); // 从环境变量读取，不要硬编码
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const ALLOW_ORIGIN = "https://www.wxmktgameresearch.site"; // 无末尾斜杠

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors() });

  // 检查密钥是否存在并记录长度（不输出明文）
  if (!DEEPSEEK_API_KEY) {
    console.log("NO_KEY");
    return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY not set" }), { status: 500, headers: corsJson() });
  }
  console.log("KEY_LEN", DEEPSEEK_API_KEY.length);

  try {
    const { prompt, model = "deepseek-chat", max_tokens = 2000, temperature = 0.7 } = await req.json();
    if (!prompt) return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers: corsJson() });

    // 轻量健康检查：避免依赖 Logs 也能快速判断密钥与 CORS 状态
    if (prompt === "__health__") {
      return new Response(
        JSON.stringify({
          ok: true,
          hasKey: Boolean(DEEPSEEK_API_KEY),
          keyLen: DEEPSEEK_API_KEY?.length || 0,
          allowOrigin: ALLOW_ORIGIN
        }),
        { status: 200, headers: corsJson() }
      );
    }

    const upstream = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens,
        temperature,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.log("UPSTREAM_STATUS", upstream.status, text);
      return new Response(
        JSON.stringify({ error: "Upstream error", detail: text, status: upstream.status }),
        { status: 502, headers: corsJson() }
      );
    }

    const data = await upstream.json();
    return new Response(JSON.stringify({ data }), { status: 200, headers: corsJson() });
  } catch (e: any) {
    console.error("SERVER_ERROR", e?.message || String(e));
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