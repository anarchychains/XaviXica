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
  // tenta usar req.body (quando o runtime já parseou)
  if (req.body && typeof req.body === "object") return req.body;

  // se veio string
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }

  // fallback: lê o stream
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

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
      return res.status(400).json({ error: "topic é obrigatório" });
    }

    // Debug sem vazar segredo
    const hasKey = Boolean(process.env.OPENAI_API_KEY);
    if (!hasKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não encontrada no ambiente",
        detail: "Verifique as Environment Variables do projeto correto no Vercel e faça um redeploy.",
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
CTA DESEJADO: ${String(ctaDesired || "").trim() || "(não informado — proponha um CTA apropriado)"}

FONTES (use como base, não invente dado factual):
${sourcesToText(sources)}

Regras:
- Se a fonte for um link, trate como referência e não invente conteúdo específico do link.
- Hashtags: 6 a 12, sem # no texto (apenas as palavras).
- Headline curta (<= 50 caracteres).
`.trim();

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await openai.responses.create({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      text: {
        format: {
          type: "json_schema",
          strict: true,
          name: "content_payload",
          schema,
        },
      },
    });

    const jsonText = response.output_text;
    const parsed = JSON.parse(jsonText);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("generate error:", err);
    return res.status(500).json({
      error: "Falha ao gerar conteúdo",
      detail: String(err?.message || err),
    });
  }
}
