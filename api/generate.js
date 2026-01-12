import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function sourcesToText(sources) {
  const arr = Array.isArray(sources) ? sources : [];
  if (!arr.length) return "Sem fontes.";
  return arr
    .map((s, i) => {
      const value = typeof s === "string" ? s : s?.value;
      const type = typeof s === "string" ? "text" : s?.type || "text";
      if (!value) return null;
      return `${i + 1}. (${type}) ${value}`;
    })
    .filter(Boolean)
    .join("\n");
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Pequena pausa (ms) */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Decide se vale retry.
 * - 429 por rate limit → retry
 * - 429 por billing/quota → NÃO retry
 * - 5xx → retry
 */
function classifyOpenAIError(err) {
  const status = err?.status || err?.response?.status;
  const code = err?.code || err?.error?.code;
  const message = String(err?.message || "");

  const is429 = status === 429;

  // rate limit pode vir com códigos diferentes ou só no texto
  const isRateLimit =
    is429 &&
    (code === "rate_limit_exceeded" ||
      code === "rate_limited" ||
      /rate limit/i.test(message) ||
      /too many requests/i.test(message));

  const isQuotaOrBilling =
    is429 &&
    (code === "insufficient_quota" ||
      /insufficient_quota/i.test(message) ||
      /billing/i.test(message) ||
      /quota/i.test(message));

  const is5xx = status >= 500 && status <= 599;

  return {
    status,
    code,
    message,
    isRateLimit,
    isQuotaOrBilling,
    isRetryable: isRateLimit || is5xx,
    publicCode: isQuotaOrBilling
      ? "insufficient_quota"
      : isRateLimit
      ? "rate_limited"
      : is5xx
      ? "temporary_error"
      : "unknown_error",
  };
}

/** Chama OpenAI com retry (quando fizer sentido) */
async function createResponseWithRetry(payload, { maxRetries = 3 } = {}) {
  let attempt = 0;

  while (true) {
    try {
      return await openai.responses.create(payload);
    } catch (err) {
      const info = classifyOpenAIError(err);
      attempt += 1;

      // quota/billing: não adianta insistir
      if (info.isQuotaOrBilling) throw err;

      if (!info.isRetryable || attempt > maxRetries) throw err;

      // Exponential backoff + jitter
      const base = 500; // 0.5s
      const wait = base * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      await sleep(wait + jitter);
    }
  }
}

export default async function handler(req, res) {
  const traceId =
    req.headers["x-vercel-id"] ||
    req.headers["x-request-id"] ||
    `local_${Date.now()}`;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST", traceId });
  }

  // cronômetro total da requisição
  const startedAt = Date.now();

  try {
    const body = await readJsonBody(req);

    const {
      topic = "",
      audience = "",
      ctaDesired = "",
      platform = "instagram",
      format = "feed",
      characteristic = "educational",
      sources = [],
    } = body || {};

    const safeTopic = String(topic || "").trim();
    if (!safeTopic) {
      return res.status(400).json({ error: "topic é obrigatório", traceId });
    }

    const hasKey = Boolean(process.env.OPENAI_API_KEY);
    if (!hasKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não encontrada no ambiente",
        detail:
          "Verifique as Environment Variables do projeto correto no Vercel e faça um redeploy.",
        traceId,
      });
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        copy: { type: "string" },
        hashtags: { type: "array", items: { type: "string" } },
        cta: { type: "string" },
        designElements: {
          type: "object",
          additionalProperties: false,
          properties: {
            headline: { type: "string" },
            subheadline: { type: "string" },
            layout: { type: "string" },
            visualConcept: { type: "string" },
          },
          required: ["headline", "subheadline", "layout", "visualConcept"],
        },
      },
      required: ["title", "copy", "hashtags", "cta", "designElements"],
    };

    const system = [
      "Você é um agente de criação de conteúdo.",
      "Gere conteúdo direto, útil, com boa cadência e sem enrolação.",
      "Respeite plataforma e formato.",
      "Sempre retorne APENAS JSON válido no schema pedido.",
    ].join(" ");

    const user = `
TEMA: ${safeTopic}
PLATAFORMA: ${platform}
FORMATO: ${format}
TOM/PERFIL: ${characteristic}

PÚBLICO-ALVO: ${String(audience || "").trim() || "(não informado)"}
CTA DESEJADO: ${
      String(ctaDesired || "").trim() ||
      "(não informado — proponha um CTA apropriado)"
    }

FONTES (use como base, não invente dado factual):
${sourcesToText(sources)}

Regras:
- Se a fonte for um link, trate como referência e não invente conteúdo específico do link.
- Hashtags: 6 a 12, sem # no texto (apenas as palavras).
- Headline curta (<= 50 caracteres).
`.trim();

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const payload = {
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_output_tokens: 700,
      text: {
        format: {
          type: "json_schema",
          strict: true,
          name: "content_payload",
          schema,
        },
      },
    };

    // cronômetro só da OpenAI
    const openaiStartedAt = Date.now();

    const response = await createResponseWithRetry(payload, { maxRetries: 3 });

    const openaiMs = Date.now() - openaiStartedAt;

    // ===== RELÓGIO INVISÍVEL (tokens + custo) =====
    const usage = response?.usage || {};
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;

    // preços do gpt-4o-mini (USD por 1 milhão de tokens)
    const PRICE_INPUT_PER_1M = 0.15;
    const PRICE_OUTPUT_PER_1M = 0.60;

    const costUSD =
      (inputTokens / 1_000_000) * PRICE_INPUT_PER_1M +
      (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_1M;

    console.log("[COST]", {
      traceId,
      model,
      inputTokens,
      outputTokens,
      costUSD: Number(costUSD.toFixed(6)),
    });

    console.log("[PERF]", {
      traceId,
      openaiMs,
      totalMs: Date.now() - startedAt,
    });
    // ============================================

    const jsonText = response.output_text;

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      return res.status(502).json({
        error: "A IA retornou um JSON inválido (raro).",
        detail: "Tente novamente. Se persistir, revise o prompt/schema.",
        traceId,
      });
    }

    return res.status(200).json({ ...parsed, traceId });
  } catch (err) {
    const info = classifyOpenAIError(err);

    console.error("generate error:", {
      traceId,
      status: info.status,
      code: info.code,
      message: info.message,
    });

    if (info.publicCode === "insufficient_quota") {
      return res.status(429).json({
        error: "Limite de uso/billing atingido na OpenAI.",
        code: "insufficient_quota",
        detail: "Verifique billing/limites do projeto e tente novamente.",
        traceId,
      });
    }

    if (info.publicCode === "rate_limited") {
      return res.status(429).json({
        error: "Muitas tentativas em sequência (rate limit).",
        code: "rate_limited",
        detail: "Aguarde alguns segundos e tente novamente.",
        traceId,
      });
    }

    if (info.publicCode === "temporary_error") {
      return res.status(503).json({
        error: "Instabilidade temporária ao gerar conteúdo.",
        code: "temporary_error",
        detail: "Tente novamente em alguns segundos.",
        traceId,
      });
    }

    return res.status(500).json({
      error: "Falha ao gerar conteúdo",
      code: "unknown_error",
      detail: info.message,
      traceId,
    });
  }
}
