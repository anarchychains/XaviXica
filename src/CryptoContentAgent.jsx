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
  FileText,
  Loader2,
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

function Notice({ type = "info", children }) {
  const styles =
    type === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : type === "warn"
      ? "bg-yellow-50 border-yellow-200 text-yellow-800"
      : "bg-purple-50 border-purple-200 text-purple-700";

  return (
    <div className={`text-xs ${styles} border rounded-lg p-3 flex items-start gap-2`}>
      <Sparkles size={16} className="mt-[2px]" />
      <div>{children}</div>
    </div>
  );
}

/* ===============================
   HELPERS (links + paste)
================================ */
function isUrl(s) {
  const raw = (s || "").trim();
  if (!raw) return false;
  return /^https?:\/\/\S+/i.test(raw) || /^[a-z0-9.-]+\.[a-z]{2,}\/\S+/i.test(raw);
}

function normalizeUrl(input) {
  const raw = (input || "").trim();
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
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

  const [sourceInput, setSourceInput] = useState("");
  const [sources, setSources] = useState([]); // [{ id, type:"link"|"text", value, relatedTo? }]

  const [needsPaste, setNeedsPaste] = useState(false);
  const [pendingLinkId, setPendingLinkId] = useState(null);
  const [pasteText, setPasteText] = useState("");

  const [plan, setPlan] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [customDirection, setCustomDirection] = useState("");

  const [generated, setGenerated] = useState(null);

  const [isPlanning, setIsPlanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatsForPlatform = FORMATS_BY_PLATFORM[platform] || [];
  const characteristicObj = CHARACTERISTICS.find((c) => c.id === characteristic);
  const platformObj = PLATFORMS.find((p) => p.id === platform);

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
        if (data.plan) setPlan(data.plan);
        if (typeof data.selectedOptionId === "string") setSelectedOptionId(data.selectedOptionId);
        if (typeof data.customDirection === "string") setCustomDirection(data.customDirection);
        if (data.generated) setGenerated(data.generated);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    storage.set(
      "xavixica:create",
      JSON.stringify({
        topic,
        platform,
        format,
        characteristic,
        sources,
        plan,
        selectedOptionId,
        customDirection,
        generated,
      })
    );
  }, [topic, platform, format, characteristic, sources, plan, selectedOptionId, customDirection, generated]);

  const copyPayload = useMemo(() => {
    if (!generated) return "";
    const tags = (generated.hashtags || []).map((t) => `#${t}`).join(" ");
    return [generated.title, generated.copy, tags].filter(Boolean).join("\n\n");
  }, [generated]);

  function resetAIOutputs() {
    setErrorMsg("");
    setPlan(null);
    setSelectedOptionId("");
    setCustomDirection("");
    setGenerated(null);
  }

  function addSource() {
    const raw = (sourceInput || "").trim();
    if (!raw) return;

    if (isUrl(raw)) {
      const url = normalizeUrl(raw);

      if (sources.some((s) => s.type === "link" && s.value === url)) {
        setSourceInput("");
        return;
      }

      const linkId = crypto.randomUUID();
      setSources((prev) => [...prev, { id: linkId, type: "link", value: url }]);
      setSourceInput("");

      setNeedsPaste(true);
      setPendingLinkId(linkId);
      setPasteText("");

      resetAIOutputs();
      return;
    }

    setSources((prev) => [...prev, { id: crypto.randomUUID(), type: "text", value: raw }]);
    setSourceInput("");
    resetAIOutputs();
  }

  function removeSource(id) {
    setSources((prev) => prev.filter((s) => s.id !== id));
    if (id === pendingLinkId) {
      setNeedsPaste(false);
      setPendingLinkId(null);
      setPasteText("");
    }
    resetAIOutputs();
  }

  function savePasteForLink() {
    const t = (pasteText || "").trim();
    if (t.length < 60) {
      setErrorMsg("Cole um trecho maior (pelo menos algumas linhas) pra garantir precisão.");
      return;
    }

    setSources((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "text", value: t, relatedTo: pendingLinkId },
    ]);

    setNeedsPaste(false);
    setPendingLinkId(null);
    setPasteText("");
    setErrorMsg("");
    resetAIOutputs();
  }

  function cancelPaste() {
    setNeedsPaste(false);
    setPendingLinkId(null);
    setPasteText("");
  }

  function buildPayloadBase() {
    return {
      topic: topic.trim(),
      audience: "(não informado)",
      ctaDesired: "(não informado)",
      platform,
      format,
      characteristic,
      sources: sources.map((s) => ({ type: s.type, value: s.value })),
    };
  }

  async function handlePlan() {
    if (!topic.trim()) return;

    if (needsPaste) {
      setErrorMsg("Antes de continuar: cole o trecho principal da fonte (pra IA ler de verdade).");
      return;
    }

    setIsPlanning(true);
    setErrorMsg("");
    setPlan(null);
    setSelectedOptionId("");
    setCustomDirection("");
    setGenerated(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "plan", ...buildPayloadBase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data?.detail || data?.error || "Falha ao analisar e sugerir A/B/C.");
        return;
      }

      if (data?.sourceReadiness?.canReliablyUseSources === false) {
        setErrorMsg(data?.sourceReadiness?.messageToUser || "Cole o texto da fonte pra garantir precisão.");
        setPlan(data);
        return;
      }

      setPlan(data);
    } catch (e) {
      setErrorMsg(String(e?.message || e));
    } finally {
      setIsPlanning(false);
    }
  }

  async function handleGenerateFinal() {
    const hasCustom = Boolean(customDirection.trim());
    const hasChoice = Boolean(selectedOptionId);

    if (!hasCustom && !hasChoice) {
      setErrorMsg("Escolha A/B/C ou escreva seu direcionamento (override).");
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setGenerated(null);

    try {
      const payload = {
        phase: "generate",
        ...buildPayloadBase(),
        ...(hasCustom ? { customDirection: customDirection.trim() } : { selectedOptionId }),
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data?.detail || data?.error || "Falha ao gerar conteúdo final.");
        return;
      }

      setGenerated(data);
    } catch (e) {
      setErrorMsg(String(e?.message || e));
    } finally {
      setIsGenerating(false);
    }
  }

  const sourcesCount = sources.length;
  const linksCount = sources.filter((s) => s.type === "link").length;
  const textCount = sources.filter((s) => s.type === "text").length;

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
            IA para creators: entender suas fontes, sugerir caminhos e gerar conteúdo final.
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

              {errorMsg ? <Notice type="warn">{errorMsg}</Notice> : null}

              {/* 1) Tema */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobre o que você quer postar?
                </label>
                <input
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    resetAIOutputs();
                  }}
                  placeholder="Ex: Regras do cashback: como funciona e o que mudou?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* 2) Fontes */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <LinkIcon size={16} className="text-purple-600" />
                  Fontes (links + texto colado)
                </div>

                <p className="text-xs text-gray-600">
                  Link sozinho vira só referência. Para a IA “absorver”, você cola o texto principal.
                </p>

                <div className="flex gap-2">
                  <input
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                    placeholder="Cole um link (thread/artigo) OU cole um trecho em texto"
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

                {needsPaste ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <FileText size={16} className="text-purple-600" />
                      Cole o trecho principal dessa fonte
                    </div>

                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Cole aqui o texto da fonte (thread, doc, trecho do artigo)…"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={savePasteForLink}
                        className="px-4 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:opacity-90"
                      >
                        Salvar trecho
                      </button>
                      <button
                        type="button"
                        onClick={cancelPaste}
                        className="px-4 py-2 rounded-lg font-semibold bg-white border border-gray-300 hover:bg-gray-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : null}

                {sourcesCount > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sources.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs"
                        title={s.type === "link" ? s.value : (s.value || "").slice(0, 180)}
                      >
                        <span className="text-[10px] px-2 py-0.5 rounded-full border">
                          {s.type === "link" ? "link" : "texto"}
                        </span>

                        <span className="max-w-[260px] truncate">
                          {s.type === "link"
                            ? s.value
                            : (s.value || "").replace(/\s+/g, " ").trim()}
                        </span>

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
                  Fontes: <strong>{sourcesCount}</strong> (links: <strong>{linksCount}</strong>, texto:{" "}
                  <strong>{textCount}</strong>)
                </div>
              </div>

              {/* 3) Tom */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tom / personalidade
                  </label>
                  <select
                    value={characteristic}
                    onChange={(e) => {
                      setCharacteristic(e.target.value);
                      resetAIOutputs();
                    }}
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
                  <div className="font-semibold mb-1">O que acontece no fluxo?</div>
                  <div>1) lê fonte → 2) sugere A/B/C → 3) você escolhe → 4) gera final.</div>
                </div>
              </div>

              {/* 4) Plataforma + 5) Formato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
                  <div className="space-y-2">
                    {PLATFORMS.map((p) => (
                      <Pill
                        key={p.id}
                        active={platform === p.id}
                        onClick={() => {
                          setPlatform(p.id);
                          resetAIOutputs();
                        }}
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
                        onClick={() => {
                          setFormat(f.id);
                          resetAIOutputs();
                        }}
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

              {/* Botão 1: PLAN */}
              <button
                onClick={handlePlan}
                disabled={!topic.trim() || isPlanning || isGenerating}
                type="button"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlanning ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isPlanning ? "Lendo fonte e pensando..." : "Analisar e sugerir A/B/C"}
              </button>

              {/* Tela A/B/C */}
              {plan ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                  <div className="font-bold text-gray-900">
                    ✅ Absorvi seu contexto. Agora escolha uma abordagem:
                  </div>

                  <div className="text-xs text-gray-600">
                    {plan?.sourceReadiness?.messageToUser || ""}
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    {(plan?.editorialOptions || []).map((opt) => (
                      <button
                        key={opt.optionId}
                        type="button"
                        onClick={() => {
                          setSelectedOptionId(opt.optionId);
                          setCustomDirection("");
                          setErrorMsg("");
                        }}
                        className={[
                          "text-left rounded-lg border-2 p-4 transition",
                          selectedOptionId === opt.optionId
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 bg-white hover:border-gray-300",
                        ].join(" ")}
                      >
                        <div className="font-bold text-gray-900">
                          {opt.optionId}) {opt.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                          <div><strong>Ângulo:</strong> {opt.editorialAngle}</div>
                          <div><strong>Foco:</strong> {opt.focus}</div>
                          <div><strong>Tom:</strong> {opt.tone}</div>
                          <div><strong>Fontes:</strong> {opt.howSourcesAreUsed}</div>
                          <div><strong>CTA:</strong> {opt.ctaSuggestion}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <div className="text-sm font-semibold text-gray-800">
                      Ou escreva seu próprio direcionamento (override):
                    </div>
                    <textarea
                      value={customDirection}
                      onChange={(e) => {
                        setCustomDirection(e.target.value);
                        if (e.target.value.trim()) setSelectedOptionId("");
                      }}
                      rows={4}
                      placeholder="Ex: Quero tom investigativo, conectando conflitos entre fontes, com hook forte e CTA pra comentar..."
                      className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="text-[11px] text-gray-500 mt-1">
                      Se você escrever aqui, substitui A/B/C.
                    </div>
                  </div>

                  {/* Botão 2: GENERATE */}
                  <button
                    type="button"
                    onClick={handleGenerateFinal}
                    disabled={isGenerating || (!customDirection.trim() && !selectedOptionId)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {isGenerating ? "Gerando conteúdo final..." : "Gerar Conteúdo Final"}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Resultado */}
            {generated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg">📄 Conteúdo gerado</div>
                      <div className="text-xs text-gray-500">
                        Tom: <strong>{characteristicObj?.label}</strong>
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
                    traceId: <strong>{generated.traceId || "—"}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Placeholder tabs */}
        {activeTab !== "create" ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-gray-700">
            <div className="font-bold mb-2">Em construção</div>
            <div className="text-sm">
              Vamos construir isso depois que a base de “Criar Conteúdo” estiver 100% redonda.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
