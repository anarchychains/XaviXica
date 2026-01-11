import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Twitter,
  Instagram,
  Linkedin,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import { storage } from "./lib/storage";

// ===============================
// Config base (fácil de mexer)
// ===============================
const CHARACTERISTICS = [
  {
    id: "sell",
    label: "Vender (direto ao ponto)",
    hint: "Foco em oferta, benefício, CTA forte, urgência leve.",
  },
  {
    id: "reflective",
    label: "Reflexivo / filosófico",
    hint: "Mais humano, introspectivo, perguntas, metáforas leves.",
  },
  {
    id: "investigative",
    label: "Repórter investigativo",
    hint: "Tom de apuração, evidências, ‘o que ninguém te contou’.",
  },
  {
    id: "educational",
    label: "Educativo / didático",
    hint: "Explica sem jargão, exemplos, estrutura em passos.",
  },
  {
    id: "controversial",
    label: "Polêmico (controlado)",
    hint: "Hot take sem ser tóxico; provoca, mas entrega valor.",
  },
  {
    id: "storytelling",
    label: "Storytelling",
    hint: "Começa com uma cena/história e vira insight aplicável.",
  },
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "twitter", label: "Twitter/X", icon: Twitter },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
];

const FORMATS_BY_PLATFORM = {
  instagram: [
    { id: "feed", label: "Feed Post", ratio: "1:1" },
    { id: "stories", label: "Stories", ratio: "9:16" },
    { id: "reels", label: "Reels", ratio: "9:16" },
    { id: "carousel", label: "Carrossel", ratio: "1:1" },
  ],
  twitter: [
    { id: "tweet", label: "Tweet", ratio: "16:9" },
    { id: "thread", label: "Thread", ratio: "16:9" },
  ],
  linkedin: [
    { id: "post", label: "Post", ratio: "1.91:1" },
    { id: "article", label: "Artigo", ratio: "1.91:1" },
  ],
};

// ===============================
// Mock “gerador” (por enquanto)
// depois a gente troca por IA real
// ===============================
function mockGenerate({ topic, platform, format, characteristic }) {
  const c = characteristic;

  const baseTitle = (() => {
    if (c === "investigative") return `O que ninguém te contou sobre: ${topic}`;
    if (c === "reflective") return `${topic} (e por que isso mexe com você)`;
    if (c === "sell") return `Se você quer ${topic}, leia isso antes`;
    if (c === "educational") return `Guia rápido: ${topic} (sem enrolação)`;
    if (c === "controversial") return `Opinião impopular: ${topic}`;
    if (c === "storytelling") return `Eu vi isso acontecendo com ${topic}…`;
    return topic;
  })();

  const hashtags =
    platform === "linkedin"
      ? ["marketing", "criadores", "produtividade", "IA"]
      : platform === "instagram"
        ? ["criadores", "conteudo", "IA", "socialmedia", "growth"]
        : ["ai", "creators", "content", "growth"];

  const cta =
    c === "sell"
      ? "Quer isso pronto no 1-clique? Me chama."
      : "Se isso te ajudou, salva e compartilha.";

  const copy = (() => {
    if (platform === "twitter" && format === "thread") {
      // Thread com personalidade
      const intro =
        c === "investigative"
          ? `1/ Vamos destrinchar **${topic}** com evidência, não hype.\n`
          : c === "reflective"
            ? `1/ ${topic}. Parece simples, mas tem uma camada que quase ninguém fala.\n`
            : c === "sell"
              ? `1/ Se você quer **${topic}**, isso aqui encurta o caminho.\n`
              : c === "educational"
                ? `1/ ${topic}, explicado em 5 pontos práticos.\n`
                : c === "controversial"
                  ? `1/ Hot take: a maioria erra em ${topic} porque copia sem entender.\n`
                  : `1/ Deixa eu te contar uma história rápida sobre ${topic}.\n`;

      const body = [
        `2/ Contexto rápido: por que isso importa agora? Porque atenção é escassa e distribuição muda toda semana.`,
        `3/ ✅ O que muda na prática:\n- o que você faz amanhã?\n- qual métrica acompanha?\n- qual promessa você evita?`,
        `4/ Template que funciona:\n“Você está fazendo X. Na verdade, o que funciona é Y. Faz isso (passo 1,2,3).”`,
        `5/ Erros que derrubam alcance:\n- gancho genérico\n- sem prova/contraste\n- sem CTA claro`,
        `6/ Se você quiser, eu transformo seu tema em 3 versões (vender / reflexivo / investigativo).`,
      ].join("\n\n");

      return `${intro}\n${body}`;
    }

    // Padrão (IG/LinkedIn)
    const opening =
      c === "investigative"
        ? `📌 O que pouca gente está falando sobre **${topic}**:`
        : c === "reflective"
          ? `Uma reflexão sobre **${topic}**:`
          : c === "sell"
            ? `Se você quer **${topic}**, aqui vai o atalho:`
            : c === "educational"
              ? `Aprenda **${topic}** em poucos minutos:`
              : c === "controversial"
                ? `Vou falar o que ninguém quer ouvir sobre **${topic}**:`
                : `Deixa eu te contar uma história sobre **${topic}**:`;

    const bullets =
      c === "sell"
        ? `✅ Benefício 1 (claro)\n✅ Benefício 2 (direto)\n✅ Prova/razão (curta)\n\n👉 ${cta}`
        : `✅ Um ponto que ninguém explica\n✅ Um erro comum\n✅ Um passo prático pra hoje\n\n👉 ${cta}`;

    return `${opening}\n\n${bullets}`;
  })();

  const design = {
    headline: platform === "twitter" ? "Headline" : topic,
    subheadline:
      c === "investigative"
        ? "Sem hype. Só evidência."
        : c === "reflective"
          ? "Uma ideia pra te acompanhar hoje."
          : c === "sell"
            ? "Atalho + clareza + ação."
            : c === "educational"
              ? "Prático e aplicável."
              : c === "controversial"
                ? "Discorde, mas leia até o fim."
                : "Começa numa história, termina em ação.",
    visualConcept:
      "Card limpo com headline grande, subheadline e assinatura da marca.",
    layout: "Headline central + subheadline + tag de plataforma/ratio.",
  };

  const bestTime =
    platform === "twitter" ? "8h–10h" : platform === "linkedin" ? "12h–14h" : "18h–21h";

  return {
    title: baseTitle,
    copy,
    hashtags,
    cta,
    designElements: design,
    bestTime,
    expectedMetrics: { engagement: "médio-alto", reach: "alto (se hook bater)" },
  };
}

// ===============================
// UI
// ===============================
function Pill({ active, children, onClick, Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
        active ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-gray-300",
      ].join(" ")}
    >
      {Icon ? <Icon size={18} /> : null}
      <span className="font-medium">{children}</span>
    </button>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition",
        copied
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
      ].join(" ")}
      title="Copiar conteúdo"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copiado ✅" : "Copiar"}
    </button>
  );
}

export default function CryptoContentAgent() {
  const [activeTab, setActiveTab] = useState("create");

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("feed");
  const [characteristic, setCharacteristic] = useState("educational");

  const [generated, setGenerated] = useState(null);

  // ---------- Persistência ----------
  useEffect(() => {
    (async () => {
      const saved = await storage.get("xavixica:create");
      if (!saved?.value) return;

      try {
        const data = JSON.parse(saved.value);
        if (typeof data.topic === "string") setTopic(data.topic);
        if (typeof data.platform === "string") setPlatform(data.platform);
        if (typeof data.format === "string") setFormat(data.format);
        if (typeof data.characteristic === "string") setCharacteristic(data.characteristic);
        if (data.generated) setGenerated(data.generated);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    storage.set(
      "xavixica:create",
      JSON.stringify({ topic, platform, format, characteristic, generated })
    );
  }, [topic, platform, format, characteristic, generated]);

  // Ajusta formato quando muda plataforma
  useEffect(() => {
    const formats = FORMATS_BY_PLATFORM[platform] || [];
    if (!formats.find((f) => f.id === format)) {
      setFormat(formats[0]?.id || "feed");
    }
  }, [platform]); // eslint-disable-line react-hooks/exhaustive-deps

  const platformObj = PLATFORMS.find((p) => p.id === platform);
  const formatsForPlatform = FORMATS_BY_PLATFORM[platform] || [];

  const characteristicObj = CHARACTERISTICS.find((c) => c.id === characteristic);

  const copyPayload = useMemo(() => {
    if (!generated) return "";
    const tags = (generated.hashtags || []).map((t) => `#${t}`).join(" ");
    const parts = [
      generated.title ? `🧠 ${generated.title}` : null,
      generated.copy ? generated.copy : null,
      generated.cta ? `\n${generated.cta}` : null,
      tags ? `\n\n${tags}` : null,
    ].filter(Boolean);

    return parts.join("\n\n");
  }, [generated]);

  function handleGenerate() {
    if (!topic.trim()) return;

    const content = mockGenerate({ topic, platform, format, characteristic });
    setGenerated(content);

    // evita aquele comportamento chato de perder foco/dar “jump”
    // (muito comum quando tem auto-focus/scroll; aqui mantemos simples)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Sparkles className="text-purple-600" />
            Agente de Criação de Conteúdo
          </h1>
          <p className="text-gray-600">
            Agente de IA para creators: criar, planejar e escalar sua produção de conteúdo.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b-2 border-gray-200 bg-white rounded-t-lg p-2">
          {[
            { id: "create", label: "Criar Conteúdo", icon: Sparkles },
            { id: "settings", label: "Configurações", icon: Settings },
            { id: "calendar", label: "Calendário", icon: Calendar },
            { id: "metrics", label: "Métricas", icon: BarChart3 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={[
                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                activeTab === t.id ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100",
              ].join(" ")}
              type="button"
            >
              <t.icon size={20} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Create */}
        {activeTab === "create" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Sparkles size={18} className="text-purple-600" />
                Criar Conteúdo
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobre o que você quer postar?
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Qual a probabilidade de um token performar bem em 2026?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                {topic?.trim() ? (
                  <p className="text-xs text-gray-500 mt-2">
                    Pronto pra gerar: <strong>{topic}</strong>
                  </p>
                ) : null}
              </div>

              {/* Personalidade */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Característica do post (personalidade)
                  </label>
                  <select
                    value={characteristic}
                    onChange={(e) => setCharacteristic(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  >
                    {CHARACTERISTICS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {characteristicObj?.hint}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                  <div className="font-semibold mb-1">Como isso impacta?</div>
                  <div>
                    A personalidade define o <strong>tom</strong>, o <strong>ritmo</strong> e o{" "}
                    <strong>tipo de hook</strong>. Depois a gente pluga a IA real mantendo esse mesmo
                    contrato.
                  </div>
                </div>
              </div>

              {/* Plataforma + Formato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plataforma
                  </label>
                  <div className="space-y-2">
                    {PLATFORMS.map((p) => (
                      <Pill
                        key={p.id}
                        active={platform === p.id}
                        onClick={() => setPlatform(p.id)}
                        Icon={p.icon}
                      >
                        {p.label}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <div className="space-y-2">
                    {formatsForPlatform.map((f) => (
                      <Pill
                        key={f.id}
                        active={format === f.id}
                        onClick={() => setFormat(f.id)}
                        Icon={MessageSquare}
                      >
                        <div className="flex flex-col">
                          <span>{f.label}</span>
                          <span className="text-xs text-gray-500">{f.ratio}</span>
                        </div>
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleGenerate}
                disabled={!topic.trim()}
                type="button"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={18} />
                Gerar Conteúdo
              </button>
            </div>

            {/* Result grid */}
            {generated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview mock */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="font-semibold">Preview (mock)</div>
                    <div className="text-xs text-gray-500">
                      {platformObj?.label} • {formatsForPlatform.find((f) => f.id === format)?.label}
                    </div>
                  </div>
                  <div
                    className="p-8 text-white flex items-center justify-center"
                    style={{
                      minHeight: 360,
                      background: "linear-gradient(135deg, #7C3AED 0%, #10B981 100%)",
                    }}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-4xl font-extrabold leading-tight">
                        {generated.designElements?.headline || "Headline"}
                      </div>
                      <div className="opacity-90">
                        {generated.designElements?.subheadline || "Subheadline"}
                      </div>
                      <div className="text-xs opacity-75 pt-4">
                        {formatsForPlatform.find((f) => f.id === format)?.label} • {platformObj?.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated content */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg">📄 Conteúdo gerado</div>
                      <div className="text-xs text-gray-500">
                        Personalidade: <strong>{characteristicObj?.label}</strong>
                      </div>
                    </div>
                    <CopyButton text={copyPayload} />
                  </div>

                  {generated.title ? (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500">Título</div>
                      <div className="font-semibold text-gray-900">{generated.title}</div>
                    </div>
                  ) : null}

                  {generated.copy ? (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500">Copy</div>
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        {generated.copy}
                      </pre>
                    </div>
                  ) : null}

                  {generated.cta ? (
                    <div className="text-sm">
                      <span className="font-semibold text-purple-700">CTA:</span>{" "}
                      <span className="text-gray-800">{generated.cta}</span>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(generated.hashtags || []).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Melhor horário sugerido: <strong>{generated.bestTime}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Placeholder tabs */}
        {activeTab !== "create" && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-700">
            <div className="font-bold mb-2">Em construção</div>
            <div className="text-sm">
              Vamos construir isso depois que a base de “Criar Conteúdo” estiver 100% redonda.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
