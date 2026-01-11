function platformLabel(platform) {
  if (platform === "instagram") return "Instagram";
  if (platform === "twitter") return "Twitter/X";
  if (platform === "linkedin") return "LinkedIn";
  return platform || "Instagram";
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
  return map[format] || format || "Feed Post";
}

function characteristicProfile(id) {
  const profiles = {
    sell: {
      label: "Vender (direto ao ponto)",
      hook: "Atalho honesto:",
      cta: "Quer que eu adapte isso pro seu caso? Comenta “QUERO”.",
      hashtags: ["marketing", "vendas", "copywriting", "criadores"],
      subheadline: "Atalho + clareza + ação.",
    },
    reflective: {
      label: "Reflexivo / filosófico",
      hook: "Uma reflexão que vale guardar:",
      cta: "Se isso bateu, salva e manda pra alguém.",
      hashtags: ["reflexao", "criadores", "conteudo", "mente"],
      subheadline: "Uma ideia pra te acompanhar hoje.",
    },
    investigative: {
      label: "Repórter investigativo",
      hook: "O que ninguém te contou:",
      cta: "Se quiser, eu monto 3 ângulos com base nessas fontes.",
      hashtags: ["investigacao", "conteudo", "analise", "criadores"],
      subheadline: "Sem hype. Só evidência.",
    },
    educational: {
      label: "Educativo / didático",
      hook: "Guia rápido (sem enrolação):",
      cta: "Salva pra usar como checklist.",
      hashtags: ["educacao", "conteudo", "produtividade", "criadores"],
      subheadline: "Prático e aplicável.",
    },
    controversial: {
      label: "Polêmico (controlado)",
      hook: "Opinião impopular (com argumento):",
      cta: "Discorda? Beleza. Só responde com 1 contra-exemplo.",
      hashtags: ["opinioes", "conteudo", "criadores", "debate"],
      subheadline: "Discorde, mas leia até o fim.",
    },
    storytelling: {
      label: "Storytelling",
      hook: "Uma história real (e a lição):",
      cta: "Se você já passou por isso, comenta “eu também”.",
      hashtags: ["storytelling", "criadores", "conteudo", "aprendizados"],
      subheadline: "Começa numa história, termina em ação.",
    },
  };

  return profiles[id] || profiles.educational;
}

function audienceTone(audience) {
  const a = (audience || "").trim().toLowerCase();
  if (!a) {
    return {
      prefix: "",
      vocabulary: "neutro",
      note: "",
    };
  }

  const beginnerHints = ["iniciante", "começando", "do zero", "leigo", "primeira vez"];
  const advancedHints = ["avançado", "pro", "experiente", "sênior", "deep", "técnico", "power user"];
  const founderHints = ["founder", "empreendedor", "saaS", "startup", "indie", "maker", "dev"];
  const creatorHints = ["creator", "criador", "influencer", "ugc", "tiktok", "instagram", "youtuber"];
  const b2bHints = ["b2b", "empresa", "time", "marketing", "vendas", "produto"];

  const isBeginner = beginnerHints.some((k) => a.includes(k));
  const isAdvanced = advancedHints.some((k) => a.includes(k));
  const isFounder = founderHints.some((k) => a.includes(k));
  const isCreator = creatorHints.some((k) => a.includes(k));
  const isB2B = b2bHints.some((k) => a.includes(k));

  let vocabulary = "neutro";
  if (isBeginner) vocabulary = "simples";
  if (isAdvanced) vocabulary = "técnico (com precisão)";

  const prefix = `Pra ${audience}: `;
  const noteParts = [];

  if (isBeginner) noteParts.push("sem jargão");
  if (isAdvanced) noteParts.push("com nuance e trade-offs");
  if (isFounder) noteParts.push("puxando pra crescimento e execução");
  if (isCreator) noteParts.push("pensando em retenção e distribuição");
  if (isB2B) noteParts.push("com foco em clareza e decisão");

  const note = noteParts.length ? `(${noteParts.join(", ")})` : "";

  return { prefix, vocabulary, note };
}

function summarizeSources(sources) {
  const arr = Array.isArray(sources) ? sources : [];
  if (!arr.length) return "";

  const first = arr[0]?.value || "";
  const total = arr.length;

  if (total === 1) return `Base: 1 fonte — ${first}`;
  return `Base: ${total} fontes — ex: ${first}`;
}

function bestTimeFor(platform) {
  if (platform === "twitter") return "8h–10h ou 18h–20h";
  if (platform === "linkedin") return "12h–14h";
  return "18h–21h";
}

function expectedMetricsFor(platform, characteristic) {
  if (platform === "twitter" && characteristic === "controversial") {
    return { engagement: "alto", reach: "alto (se a resposta vier rápido)" };
  }
  if (platform === "linkedin" && (characteristic === "educational" || characteristic === "investigative")) {
    return { engagement: "médio-alto", reach: "médio-alto" };
  }
  return { engagement: "médio", reach: "médio-alto" };
}

function buildCopy({ topic, audience, platform, format, characteristic, sources }) {
  const profile = characteristicProfile(characteristic);
  const aud = audienceTone(audience);
  const baseLine = summarizeSources(sources);

  const whoLine = audience?.trim()
    ? `🎯 Público-alvo: ${audience.trim()} ${aud.note}`.trim()
    : "";

  // THREAD (twitter)
  if (platform === "twitter" && format === "thread") {
    const intro = `1/ ${profile.hook} **${topic}**.\n${aud.prefix}${aud.note}`.trim();
    const body = [
      `2/ Contexto rápido: por que isso importa agora? Porque atenção é escassa e distribuição muda toda semana.`,
      `3/ ✅ O que muda na prática:\n- o que você faz amanhã?\n- qual métrica acompanha?\n- qual promessa você evita?`,
      `4/ Um template que funciona:\n“Você está fazendo X. Na verdade, o que funciona é Y. Faça isso (passo 1, 2, 3).”`,
      `5/ Erros que derrubam alcance:\n- gancho genérico\n- sem prova/contraste\n- CTA fraco`,
      audience?.trim()
        ? `6/ Ajuste fino pra ${audience.trim()}:\n- exemplo mais próximo do seu contexto\n- vocabulário: ${aud.vocabulary}\n- CTA alinhado ao momento`
        : `6/ Ajuste fino: troque o exemplo e o CTA pro seu contexto.`,
      baseLine ? `7/ ${baseLine}` : null,
      `8/ ${profile.cta}`,
    ].filter(Boolean);

    return `${intro}\n\n${body.join("\n\n")}`;
  }

  // TWEET (twitter)
  if (platform === "twitter" && format === "tweet") {
    const line1 = `${profile.hook} ${topic}.`;
    const line2 = audience?.trim()
      ? `Pra ${audience.trim()}, o erro nº1 é tentar parecer “expert” cedo demais.`
      : `O erro nº1 é tentar ser genérico pra todo mundo.`;
    const line3 = `Faz isso: 1) hook claro 2) 1 prova/contraste 3) 1 próximo passo.`;
    const line4 = profile.cta;
    const extra = baseLine ? `\n\n${baseLine}` : "";
    return `${line1}\n\n${line2}\n${line3}\n\n${line4}${extra}`;
  }

  // LINKEDIN/IG (padrão)
  const opening = `${profile.hook} ${topic}`;
  const bullets = [
    audience?.trim()
      ? `🎯 Pra quem: ${audience.trim()} ${aud.note}`.trim()
      : null,
    `✅ 1 ideia que quase ninguém aplica (e é simples).`,
    `✅ 1 erro comum que derruba alcance.`,
    `✅ 1 passo prático pra hoje.`,
    baseLine ? `📚 ${baseLine}` : null,
    `👉 ${profile.cta}`,
  ].filter(Boolean);

  return `${opening}\n\n${bullets.join("\n")}`;
}

function buildTitle({ topic, audience, characteristic, platform, format }) {
  const profile = characteristicProfile(characteristic);
  const isThread = platform === "twitter" && format === "thread";

  if (audience?.trim() && isThread) return `Pra ${audience.trim()}: ${topic} (${profile.label})`;
  if (audience?.trim()) return `${topic} — pra ${audience.trim()}`;
  if (isThread) return `A real pergunta é: ${topic} (thread)`;
  return `O que você precisa saber sobre ${topic}`;
}

function buildDesignElements({ topic, audience, characteristic, platform, format }) {
  const profile = characteristicProfile(characteristic);

  const headline =
    topic.length > 42 ? topic.slice(0, 42).trim() + "…" : topic;

  const sub =
    audience?.trim()
      ? `${profile.subheadline} • pra ${audience.trim()}`
      : profile.subheadline;

  return {
    headline,
    subheadline: sub,
    layout: `${platformLabel(platform)} / ${formatLabel(format)} — headline central + subheadline + tag`,
    visualConcept:
      "Card clean com contraste forte, headline grande e uma sublinha que explica o ângulo. Sem poluição.",
  };
}

export function generateFakeContent({
  topic,
  audience,
  platform = "instagram",
  format = "feed",
  characteristic = "educational",
  sources = [],
}) {
  const safeTopic = String(topic || "").trim();
  if (!safeTopic) {
    return {
      title: "",
      copy: "",
      hashtags: [],
      cta: "",
      designElements: { headline: "Headline", subheadline: "Subheadline" },
      bestTime: bestTimeFor(platform),
      expectedMetrics: expectedMetricsFor(platform, characteristic),
    };
  }

  const profile = characteristicProfile(characteristic);

  const title = buildTitle({ topic: safeTopic, audience, characteristic, platform, format });
  const copy = buildCopy({ topic: safeTopic, audience, platform, format, characteristic, sources });

  const hashtags = profile.hashtags;

  // CTA já vem do profile, mas mantém campo separado pro AppShell
  const cta = profile.cta;

  const designElements = buildDesignElements({ topic: safeTopic, audience, characteristic, platform, format });

  return {
    title,
    copy,
    hashtags,
    cta,
    designElements,
    bestTime: bestTimeFor(platform),
    expectedMetrics: expectedMetricsFor(platform, characteristic),
  };
}
