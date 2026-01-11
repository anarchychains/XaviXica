function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clampHashtags(tags, max = 8) {
  const uniq = Array.from(new Set(tags.map((t) => t.replace("#", "").trim())));
  return uniq.filter(Boolean).slice(0, max);
}

function platformLabel(platform) {
  if (platform === "instagram") return "Instagram";
  if (platform === "twitter") return "Twitter/X";
  if (platform === "linkedin") return "LinkedIn";
  return platform;
}

function formatLabel(format) {
  const map = {
    feed: "Feed Post",
    stories: "Stories",
    reels: "Reels",
    carrossel: "Carrossel",
    tweet: "Tweet",
    thread: "Thread",
    post: "Post",
    article: "Artigo",
  };
  return map[format] || format;
}

function buildHashtags(topic, platform) {
  const base = [
    "marketing",
    "conteudo",
    "criadores",
    "socialmedia",
    "ia",
    "produtividade",
    "branding",
    "estrategia",
  ];

  const crypto = ["cripto", "defi", "bitcoin", "web3", "onchain", "investimentos"];
  const pt = ["brasil", "portugues", "criacao"];

  const topicHints =
    topic
      .toLowerCase()
      .split(/[\s,.;:!?/()]+/g)
      .filter((w) => w.length >= 5)
      .slice(0, 3) || [];

  const extras =
    platform === "linkedin"
      ? ["carreira", "negocios", "gestao"]
      : platform === "twitter"
      ? ["buildinpublic", "makers", "threads"]
      : ["reels", "creator", "instagrambr"];

  return clampHashtags([...base, ...crypto, ...pt, ...topicHints, ...extras], platform === "twitter" ? 4 : 10);
}

function expectedMetrics(platform, format) {
  // só “placeholders” pra UX
  const table = {
    instagram: {
      feed: { engagement: "3%–6%", reach: "médio-alto" },
      stories: { engagement: "4%–9%", reach: "alto (curto prazo)" },
      reels: { engagement: "5%–12%", reach: "alto (descoberta)" },
      carrossel: { engagement: "6%–10%", reach: "médio (alto salvamento)" },
    },
    twitter: {
      tweet: { engagement: "1%–3%", reach: "médio" },
      thread: { engagement: "2%–6%", reach: "alto (se o gancho for forte)" },
    },
    linkedin: {
      post: { engagement: "2%–5%", reach: "médio" },
      article: { engagement: "1%–3%", reach: "médio (longo prazo)" },
    },
  };

  return table?.[platform]?.[format] || { engagement: "—", reach: "—" };
}

function bestTime(platform) {
  return platform === "twitter"
    ? "8h–10h ou 18h–20h"
    : platform === "linkedin"
    ? "12h–14h (dias úteis)"
    : "18h–21h";
}

function makeTitle(topic, platform, format) {
  const hooks = [
    "A real pergunta é:",
    "O que ninguém te conta:",
    "Se você só souber disso, já ganha vantagem:",
    "Checklist rápido:",
    "Guia em 60 segundos:",
    "O erro mais comum:",
  ];

  const suffix =
    platform === "twitter" && format === "thread"
      ? " (thread)"
      : platform === "linkedin" && format === "article"
      ? " (artigo)"
      : "";

  return `${pick(hooks)} ${topic}${suffix}`;
}

function makeDesignElements(topic, platform, format) {
  const headline = topic.length > 42 ? topic.slice(0, 42).trim() + "…" : topic;

  const subheadline = pick([
    "Resumo prático + CTA no final",
    "Exemplo real + passo a passo",
    "Ideias prontas pra você copiar e postar",
    "Sem enrolação: direto no ponto",
  ]);

  const visualConcept = pick([
    "Gradiente moderno + ícone minimalista + tipografia forte",
    "Card clean com headline grande e bullets curtos",
    "Layout em 2 colunas: problema → solução",
    "Carrossel: 1 gancho + 3 insights + 1 CTA",
  ]);

  const layout = `${platformLabel(platform)} • ${formatLabel(format)} — headline central + subheadline menor + bloco de bullets no rodapé`;

  return { headline, subheadline, visualConcept, layout };
}

function makeCopy(topic, platform, format) {
  const opening = pick([
    `Você já parou pra pensar em: **${topic}**?`,
    `Todo mundo fala sobre **${topic}**, mas pouca gente olha pro básico.`,
    `Se você cria conteúdo e quer crescer, esse assunto é ouro: **${topic}**.`,
    `Vamos destrinchar **${topic}** sem hype e com utilidade.`,
  ]);

  const bullets = [
    "✅ O que isso muda na prática",
    "✅ Como transformar em conteúdo hoje",
    "✅ Erros que fazem você perder alcance",
    "✅ Um template pra você copiar e postar",
  ];

  const outro = pick([
    "Se você quiser, eu transformo isso em 3 variações (curta, média e agressiva).",
    "Quer que eu adapte pra sua marca (tom, persona e palavras proibidas)?",
    "Se isso te ajudou, salva e manda pra alguém que precisa ver.",
  ]);

  if (platform === "twitter" && format === "thread") {
    // mini-thread fake (array de tweets)
    const tweets = [
      `1/ ${opening}`,
      `2/ Contexto rápido: por que isso importa agora? Porque atenção é escassa e distribuição muda toda semana.`,
      `3/ ${bullets[0]}\n- Qual ação você toma amanhã?\n- Qual métrica acompanha?\n- Qual promessa você faz?`,
      `4/ ${bullets[1]}\nTemplate: “Você está fazendo X. Na verdade, o que funciona é Y. Faça isso: (passo 1, 2, 3).”`,
      `5/ ${bullets[2]}\n- Gancho genérico\n- Sem prova/contraste\n- CTA fraco`,
      `6/ ${bullets[3]}\nGancho: “O que ninguém te conta sobre ${topic}”\nCorpo: 3 insights\nCTA: pergunta direta`,
      `7/ ${outro}\n\n(Próximo passo: ligar a IA pra gerar isso automaticamente 👀)`,
    ];

    return tweets.join("\n\n");
  }

  // post normal
  return `${opening}

**O que você precisa saber (sem novela):**
- ${bullets[0]}
- ${bullets[1]}
- ${bullets[2]}
- ${bullets[3]}

**Template rápido**
“Você acha que ${topic}. Mas na real, o que funciona é ____. Faça ____ e meça ____.”

${outro}`;
}

function makeCTA(platform) {
  if (platform === "twitter") return "Comenta “QUERO” que eu gero uma versão mais agressiva.";
  if (platform === "linkedin") return "Se quiser, comenta sua área que eu adapto o ângulo.";
  return "Salva pra usar depois e manda pra um amigo creator.";
}

export function generateFakeContent({ topic, platform, format }) {
  const safeTopic = (topic || "").trim() || "um tema viral de hoje";

  return {
    title: makeTitle(safeTopic, platform, format),
    copy: makeCopy(safeTopic, platform, format),
    hashtags: buildHashtags(safeTopic, platform),
    designElements: makeDesignElements(safeTopic, platform, format),
    cta: makeCTA(platform),
    bestTime: bestTime(platform),
    expectedMetrics: expectedMetrics(platform, format),
    meta: {
      generator: "fake",
      platform,
      format,
      createdAt: new Date().toISOString(),
    },
  };
}
