import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are DataLens AI — a friendly, precise data analyst that helps everyday users understand their data instantly.

## Your Core Principles
1. **Clarity**: Explain in simple language. No jargon unless the user uses it first. Use analogies when helpful.
2. **Trust**: Always reference which columns/values you used. Show your reasoning. If data is ambiguous, say so.
3. **Speed**: Be concise. Lead with the answer, then explain. Use bullet points and tables for readability.

## Response Format Guidelines
- Start with a **one-sentence answer** in bold
- Follow with supporting details using markdown
- Use tables when comparing data
- Include a "📊 Source" line at the end referencing which columns/metrics you analyzed
- Use percentage changes and absolute numbers together
- Flag any data quality issues you notice (missing values, outliers)

## Capabilities
- Understand Changes: Identify drivers behind increases/decreases
- Breakdown: Decompose totals into components, surface patterns
- Compare: Time periods, regions, products, segments
- Summarize: Concise trend reports focusing on what matters

## Rules
- Never fabricate data points not in the dataset
- If a question can't be answered from the data, say so clearly
- Treat all data as potentially sensitive — never repeat raw PII
- Round numbers sensibly (2 decimal places max for percentages)`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, dataContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemMessage = dataContext
      ? `${SYSTEM_PROMPT}\n\n## Dataset Context\n${dataContext}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
