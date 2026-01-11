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
  Link as LinkIcon,
  X,
} from "lucide-react";
import { storage } from "./lib/storage";

/* ===============================
   CONFIG BASE
================================ */
const CHARACTERISTICS = [
  { id: "sell", label: "Vender (direto ao ponto)", hint: "Oferta, benefício, CTA forte." },
  { id: "reflective", label: "Reflexivo / filosófico", hint: "Humano, introspectivo, perguntas." },
  { id: "investigative", label: "Repórter investigativo", hint: "Apuração, evidência, contraste." },
  { id: "educational", label: "Educativo / didático", hint: "Explica sem jargão, passo a passo." },
  { id: "controversial", label: "Polêmico (controlado)", hint: "Provoca sem ser tóxico." },
  { id: "storytelling", label: "Storytelling", hint: "História → insight → ação." },
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

/* ===============================
   MOCK GENERATOR
================================ */
function mockGenerate({ topic, platform, format, characteristic, sources }) {
  const title = `O que você precisa saber sobre ${topic}`;

  const sourcesLine =
    sources?.length > 0
      ? `\n\n(Fontes de base: ${sources.map((s) => s.url).join(" | ")})`
      : "";

  const copy =
    platform === "twitter" && format === "thread"
      ? `1/ ${topic}\n\n2/ Contexto rápido.\n\n3/ Insight prático.\n\n4/ Template copiável.\n\n5/ CTA final.${sourcesLine}`
      : `📌 ${topic}\n\n• Insight prático\n• Erro comum\n• Próximo passo\n\n👉 Salva pra usar depois.${sourcesLine}`;

  return {
    title,
    copy,
    hashtags: ["conteudo", "criadores", "IA", "produtividade"],
    cta: "Salva e compartilha.",
    designElements: {
      headline: topic,
      subheadline: "Clareza antes de escala.",
    },
    bestTime: "18h–21h",
  };
}

/* ===============================
   COMPONENTS
================================ */
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
    } catch {
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

/* ===============================
   MAIN
================================ */
export default function CryptoContentAgent() {
  const [activeTab, setActiveTab] = useState("create");

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("feed");
  const [characteristic, setCharacteristic] = useState("educational");

  // 🔗 Fontes (links)
  const [sourceInput, setSourceInput] = useState("");
  const [sources, setSources] = useState([]); // [{ id, url }]

  const [generated, setGenerated] = useState(null);

  const formatsForPlatform = FORMATS_BY_PLATFORM[platform] || [];
  const characteristicObj = CHARACTERISTICS.find((c) => c.id === characteristic);
  const platformObj = PLATFORMS.find((p) => p.id === platform);

  // Ajusta formato quando muda plataforma
  useEffect(() => {
    if (!formatsForPlatform.find((f) => f.id === format)) {
      setFormat(formatsForPlatform[0]?.id || "feed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  // Persistência
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
        if (Array.isArray(data.sources)) setSources(data.sources);
        if (data.generated) setGenerated(data.generated);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    storage.set(
      "xavixica:create",
      JSON.stringify({ topic, platform, format, characteristic, sources, generated })
    );
  }, [topic, platform, format, characteristic, sources, generated]);

  const copyPayload = useMemo(() => {
    if (!generated) return "";
    const tags = (generated.hashtags || []).map((t) => `#${t}`).join(" ");
    return [generated.title, generated.copy, tags].filter(Boolean).join("\n\n");
  }, [generated]);

  function normalizeUrl(input) {
    const raw = (input || "").trim();
    if (!raw) return "";
    // aceita colar "twitter.com/..." sem protocolo
    if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
    return raw;
  }

  function addSource() {
    const url = normalizeUrl(sourceInput);
    if (!url) return;

    // evita duplicado
    if (sources.some((s) => s.url === url)) {
      setSourceInput("");
      return;
    }

    setSources((prev) => [...prev, { id: crypto.randomUUID(), url }]);
    setSourceInput("");
  }

  function removeSource(id) {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  function handleGenerate() {
    if (!topic.trim()) return;
    const content = mockGenerate({ topic, platform, format, characteristic, sources });
    setGenerated(content);
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

              {/* 1) O que quer falar? */}
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

              {/* 2) Qual a base? (FONTES) */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <LinkIcon size={16} className="text-purple-600" />
                  Fontes (opcional)
                </div>

                <p className="text-xs text-gray-600">
                  Adicione links que sirvam de base ou inspiração. Seu conteúdo, suas regras.
                </p>

                <div className="flex gap-2">
                  <input
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                    placeholder="Cole um link (thread, artigo, vídeo, post…)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={addSource}
                    className="px-4 py-3 rounded-lg font-semibold bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    Adicionar
                  </button>
                </div>

                {sources.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sources.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs"
                        title={s.url}
                      >
                        <span className="max-w-[260px] truncate">{s.url}</span>
                        <button
                          type="button"
                          onClick={() => removeSource(s.id)}
                          className="text-gray-500 hover:text-gray-800"
                          aria-label="Remover fonte"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="text-[11px] text-gray-500">
                  A IA vai usar essas fontes como referência de <strong>tom</strong> e{" "}
                  <strong>contexto</strong>.
                </div>
              </div>

              {/* 3) Qual o tom? (PERSONALIDADE) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Característica do post (tom / personalidade)
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
                  <p className="text-xs text-gray-500 mt-2">{characteristicObj?.hint}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                  <div className="font-semibold mb-1">Como isso impacta?</div>
                  <div>
                    O tom define o <strong>ritmo</strong>, o <strong>tipo de hook</strong> e a{" "}
                    <strong>linguagem</strong>. Fontes entram como base/contexto, não como regra.
                  </div>
                </div>
              </div>

              {/* 4) Qual plataforma? + 5) Qual formato? */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
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
                      {platformObj?.label} •{" "}
                      {formatsForPlatform.find((f) => f.id === format)?.label}
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
                        {formatsForPlatform.find((f) => f.id === format)?.label} •{" "}
                        {platformObj?.label}
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
                        Tom: <strong>{characteristicObj?.label}</strong>
                        {sources.length > 0 ? (
                          <>
                            {" "}
                            • Base: <strong>{sources.length}</strong> fonte(s)
                          </>
                        ) : null}
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
