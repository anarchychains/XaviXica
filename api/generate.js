import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Helpers */
function isProbablyUrl(str) {
  if (!str) return false;
  const s = String(str).trim();
  return /^https?:\/\/\S+/i.test(s);
}

function normalizeSources(sources) {
  const arr = Array.isArray(sources) ? sources : [];
  return arr
    .map((s, idx) => {
      if (typeof s === "string") {
        return { id: idx + 1, type: isProbablyUrl(s) ? "link" : "text", value: s };
      }
      const value = s?.value ?? "";
      const typeRaw = s?.type ?? "";
      const type =
        typeRaw === "link" || typeRaw === "url"
          ? "link"
          : typeRaw === "text"
          ? "text"
          : isProbablyUrl(value)
          ? "link"
          : "text";
      return { id: idx + 1, type, value };
    })
    .filter((s) => String(s.value || "").trim().length > 0);
}

function sourcesToText(sources) {
  const arr = normalizeSources(sources);
  if (!arr.length) return "Sem fontes.";
  return arr.map((s) => `${s.id}. (${s.type}) ${s.value}`).join("\n");
}

function hasReadableSourceText(sources) {
  const arr = normalizeSources(sources);
  return arr.some((s) => s.type === "text" && String(s.value).trim().length >= 60);
}

function hasOnlyLinksOrTinyText(sources) {
  const arr = normalizeSources(sources);
  if (!arr.length) return false;
  const hasText = arr.some((s) => s.type === "text" && String(s.value).trim().length >= 60);
  const hasLinks = arr.some((s) => s.type === "link");
  return hasLinks && !hasText;
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

      if (info.isQuotaOrBilling) throw err;
      if (!info.isRetryable || attempt > maxRetries) throw err;

      const base = 500;
      const wait = base * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      await sleep(wait + jitter);
    }
  }
}

/** Custo invisível */
function logCostAndPerf({ traceId, model, response, startedAt, openaiStartedAt, phase }) {
  const openaiMs = Date.now() - openaiStartedAt;
  const usage = response?.usage || {};
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;

  // gpt-4o-mini (USD por 1 milhão de tokens)
  const PRICE_INPUT_PER_1M = 0.15;
  const PRICE_OUTPUT_PER_1M = 0.60;

  const costUSD =
    (inputTokens / 1_000_000) * PRICE_INPUT_PER_1M +
    (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_1M;

  console.log("[COST]", {
    traceId,
    phase,
    model,
    inputTokens,
    outputTokens,
    costUSD: Number(costUSD.toFixed(6)),
  });

  console.log("[PERF]", {
    traceId,
    phase,
    openaiMs,
    totalMs: Date.now() - startedAt,
  });
}

/** Schemas */
function getPlanSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      kind: { type: "string", enum: ["plan"] },
      sourceReadiness: {
        type: "object",
        additionalProperties: false,
        properties: {
          sourcesProvided: { type: "boolean" },
          canReliablyUseSources: { type: "boolean" },
          messageToUser: { type: "string" },
          missingSourceText: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                sourceId: { type: "number" },
                reason: { type: "string" },
                whatToPaste: { type: "string" },
              },
              required: ["sourceId", "reason", "whatToPaste"],
            },
          },
        },
        required: ["sourcesProvided", "canReliablyUseSources", "messageToUser", "missingSourceText"],
      },
      whatIGot: {
        type: "object",
        additionalProperties: false,
        properties: {
          topicUnderstanding: { type: "string" },
          audienceUnderstanding: { type: "string" },
          ctaUnderstanding: { type: "string" },
          toneUnderstanding: { type: "string" },
          platformUnderstanding: { type: "string" },
          formatUnderstanding: { type: "string" },
        },
        required: [
          "topicUnderstanding",
          "audienceUnderstanding",
          "ctaUnderstanding",
          "toneUnderstanding",
          "platformUnderstanding",
          "formatUnderstanding",
        ],
      },
      editorialOptions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            optionId: { type: "string", enum: ["A", "B", "C"] },
            label: { type: "string" },
            editorialAngle: { type: "string" },
            tone: { type: "string" },
            focus: { type: "string" },
            howSourcesAreUsed: { type: "string" },
            expectedReaction: { type: "string" },
            ctaSuggestion: { type: "string" },
          },
          required: [
            "optionId",
            "label",
            "editorialAngle",
            "tone",
            "focus",
            "howSourcesAreUsed",
            "expectedReaction",
            "ctaSuggestion",
          ],
        },
      },
    },
    required: ["kind", "sourceReadiness", "whatIGot", "editorialOptions"],
  };
}

function getContentSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      kind: { type: "string", enum: ["content"] },
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
    required: ["kind", "title", "copy", "hashtags", "cta", "designElements"],
  };
}

/** Prompts */
function buildPlanPrompt({
  topic,
  audience,
  ctaDesired,
  platform,
  format,
  characteristic,
  sources,
  canReliablyUseSources,
}) {
  const sourcesText = sourcesToText(sources);

  const system = [
    "Você é um editor-chefe e estrategista de conteúdo.",
    "Sua tarefa nesta fase é PROPOR DIRECIONAMENTO, não escrever o post final.",
    "Você deve respeitar as fontes fornecidas. Se a fonte não estiver legível (ex: apenas link), não invente conteúdo do link.",
    "Retorne APENAS JSON válido no schema solicitado.",
  ].join(" ");

  const user = `
FASE: PLAN (propor 3 opções A/B/C)

TEMA: ${String(topic).trim()}
PLATAFORMA: ${platform}
FORMATO: ${format}
TOM/PERFIL: ${characteristic}

PÚBLICO-ALVO: ${String(audience || "").trim() || "(não informado)"}
CTA DESEJADO: ${String(ctaDesired || "").trim() || "(não informado)"}

FONTES:
${sourcesText}

SINAL DO SISTEMA:
- canReliablyUseSources = ${canReliablyUseSources ? "true" : "false"}

Regras importantes:
- NUNCA invente conteúdo específico de links.
- Mesmo sem fontes legíveis, você pode sugerir 3 caminhos editoriais com base no tema, plataforma, formato, público e tom.
- As 3 opções devem ser bem diferentes entre si.
- Diga claramente como as fontes seriam usadas se estivessem em texto (ou peça pra colar texto).
`.trim();

  return { system, user };
}

function buildGeneratePrompt({
  topic,
  audience,
  ctaDesired,
  platform,
  format,
  characteristic,
  sources,
  selectedOption,
  customDirection,
}) {
  const sourcesText = sourcesToText(sources);

  const system = [
    "Você é um agente de criação de conteúdo com rigor editorial.",
    "Respeite plataforma e formato. Gere conteúdo direto, útil, com boa cadência e sem enrolação.",
    "Se fontes legíveis foram fornecidas (texto colado), use-as como base factual. Não invente fatos.",
    "Se houver conflito entre fontes, deixe isso explícito (sem forçar consenso).",
    "Sempre retorne APENAS JSON válido no schema pedido.",
  ].join(" ");

  const directionBlock = customDirection
    ? `DIRECIONAMENTO ESCOLHIDO PELO USUÁRIO (override):\n${String(customDirection).trim()}`
    : `DIRECIONAMENTO ESCOLHIDO (A/B/C):\n${String(selectedOption || "").trim()}`;

  const user = `
FASE: GENERATE (gerar conteúdo final)

TEMA: ${String(topic).trim()}
PLATAFORMA: ${platform}
FORMATO: ${format}
TOM/PERFIL: ${characteristic}

PÚBLICO-ALVO: ${String(audience || "").trim() || "(não informado)"}
CTA DESEJADO: ${
    String(ctaDesired || "").trim() ||
    "(não informado — proponha um CTA apropriado)"
  }

${directionBlock}

FONTES (use como base, não invente dado factual):
${sourcesText}

Regras:
- Se a fonte for um link, trate como referência e não invente conteúdo específico do link.
- Hashtags: 6 a 12, sem # no texto (apenas as palavras).
- Headline curta (<= 50 caracteres).
`.trim();

  return { system, user };
}

export default async function handler(req, res) {
  const traceId =
    req.headers["x-vercel-id"] ||
    req.headers["x-request-id"] ||
    `local_${Date.now()}`;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST", traceId });
  }

  const startedAt = Date.now();

  try {
    const body = await readJsonBody(req);

    const {
      phase = "generate", // "plan" | "generate"
      topic = "",
      audience = "",
      ctaDesired = "",
      platform = "instagram",
      format = "feed",
      characteristic = "educational",
      sources = [],
      selectedOptionId, // "A" | "B" | "C"
      selectedOptionText,
      customDirection,
    } = body || {};

    const safeTopic = String(topic || "").trim();
    if (!safeTopic) {
      return res.status(400).json({ error: "topic é obrigatório", traceId });
    }

    const hasKey = Boolean(process.env.OPENAI_API_KEY);
    if (!hasKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não encontrada no ambiente",
        detail: "Verifique as Environment Variables do projeto correto no Vercel e faça um redeploy.",
        traceId,
      });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const sourcesProvided = normalizeSources(sources).length > 0;
    const canReliablyUseSources = sourcesProvided ? hasReadableSourceText(sources) : true;

    // ========== FASE 1: PLAN ==========
    if (phase === "plan") {
      const planSchema = getPlanSchema();

      const missing = [];
      if (hasOnlyLinksOrTinyText(sources)) {
        const arr = normalizeSources(sources);
        for (const s of arr) {
          if (s.type === "link") {
            missing.push({
              sourceId: s.id,
              reason: "Fonte em link não está legível para análise precisa.",
              whatToPaste: "Cole aqui o trecho principal da fonte (texto).",
            });
          }
        }
      }

      const { system, user } = buildPlanPrompt({
        topic: safeTopic,
        audience,
        ctaDesired,
        platform,
        format,
        characteristic,
        sources,
        canReliablyUseSources,
      });

      const payload = {
        model,
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_output_tokens: 650,
        text: {
          format: {
            type: "json_schema",
            strict: true,
            name: "plan_payload",
            schema: planSchema,
          },
        },
      };

      const openaiStartedAt = Date.now();
      const response = await createResponseWithRetry(payload, { maxRetries: 3 });
      logCostAndPerf({ traceId, model, response, startedAt, openaiStartedAt, phase: "plan" });

      const jsonText = response.output_text;

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        return res.status(502).json({
          error: "A IA retornou um JSON inválido na fase de planejamento.",
          detail: "Tente novamente. Se persistir, revise o prompt/schema.",
          traceId,
        });
      }

      parsed.sourceReadiness = parsed.sourceReadiness || {};
      parsed.sourceReadiness.sourcesProvided = Boolean(sourcesProvided);
      parsed.sourceReadiness.canReliablyUseSources = Boolean(canReliablyUseSources);
      parsed.sourceReadiness.missingSourceText = missing;
      parsed.sourceReadiness.messageToUser = canReliablyUseSources
        ? "Fontes prontas para análise."
        : "Para garantir precisão, cole o trecho principal da fonte.";

      return res.status(200).json({ ...parsed, traceId });
    }

    // ========== FASE 2: GENERATE ==========
    if (phase === "generate") {
      if (sourcesProvided && !canReliablyUseSources) {
        return res.status(422).json({
          error: "Fonte não legível para análise precisa.",
          code: "sources_need_paste",
          detail: "Para garantir precisão, cole o trecho principal da fonte (texto).",
          traceId,
        });
      }

      const contentSchema = getContentSchema();

      let selectedOption = "";
      if (selectedOptionText && String(selectedOptionText).trim()) {
        selectedOption = String(selectedOptionText).trim();
      } else if (selectedOptionId) {
        selectedOption = `Opção ${selectedOptionId}`;
      }

      const hasOverride = Boolean(String(customDirection || "").trim());
      const hasChoice = Boolean(
        String(selectedOptionId || "").trim() || String(selectedOptionText || "").trim()
      );

      if (!hasOverride && !hasChoice) {
        return res.status(400).json({
          error: "Escolha uma opção (A/B/C) ou escreva um direcionamento (customDirection).",
          code: "missing_direction",
          traceId,
        });
      }

      const { system, user } = buildGeneratePrompt({
        topic: safeTopic,
        audience,
        ctaDesired,
        platform,
        format,
        characteristic,
        sources,
        selectedOption,
        customDirection,
      });

      const payload = {
        model,
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_output_tokens: 900,
        text: {
          format: {
            type: "json_schema",
            strict: true,
            name: "content_payload",
            schema: contentSchema,
          },
        },
      };

      const openaiStartedAt = Date.now();
      const response = await createResponseWithRetry(payload, { maxRetries: 3 });
      logCostAndPerf({ traceId, model, response, startedAt, openaiStartedAt, phase: "generate" });

      const jsonText = response.output_text;

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        return res.status(502).json({
          error: "A IA retornou um JSON inválido na fase de geração.",
          detail: "Tente novamente. Se persistir, revise o prompt/schema.",
          traceId,
        });
      }

      return res.status(200).json({ ...parsed, traceId });
    }

    return res.status(400).json({
      error: "phase inválida. Use 'plan' ou 'generate'.",
      code: "invalid_phase",
      traceId,
    });
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
