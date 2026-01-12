import React, { useMemo, useState, useEffect, useRef } from "react";

const CHARACTERISTICS = [
  { id: "sell", label: "Vender (direto ao ponto)", hint: "Oferta, benefício, CTA forte." },
  { id: "reflective", label: "Reflexivo / filosófico", hint: "Humano, introspectivo, perguntas." },
  { id: "investigative", label: "Repórter investigativo", hint: "Apuração, evidência, contraste." },
  { id: "educational", label: "Educativo / didático", hint: "Explica sem jargão, passo a passo." },
  { id: "controversial", label: "Polêmico (controlado)", hint: "Provoca sem ser tóxico." },
  { id: "storytelling", label: "Storytelling", hint: "História → insight → ação." },
];

const AUDIENCE_PRESETS = [
  { id: "", label: "— escolher um público (opcional) —" },
  { id: "iniciante", label: "Iniciantes (zero a um)" },
  { id: "intermediario", label: "Intermediários (já entendem o básico)" },
  { id: "avancado", label: "Avançados (deep dive, sem rodeio)" },
  { id: "criadores", label: "Criadores de conteúdo" },
  { id: "empreendedores", label: "Empreendedores / founders" },
  { id: "dev", label: "Devs / builders" },
  { id: "investidores", label: "Investidores" },
];

function PlatformLabel(platform) {
  if (platform === "instagram") return "Instagram";
  if (platform === "twitter") return "Twitter/X";
  if (platform === "linkedin") return "LinkedIn";
  return platform;
}

function FormatLabel(format) {
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

function CharacteristicLabel(id) {
  const map = {
    sell: "Vender",
    reflective: "Reflexivo",
    investigative: "Investigativo",
    educational: "Didático",
    controversial: "Polêmico",
    storytelling: "Storytelling",
  };
  return map[id] || id || "Didático";
}

function formatSourcePillLabel(src) {
  // suporta string ou objeto {type,value}
  const value = typeof src === "string" ? src : src?.value || "";
  const type = typeof src === "string" ? "text" : src?.type || "text";
  const short = value.length > 54 ? value.slice(0, 54) + "…" : value;
  const prefix = type === "link" ? "🔗" : "📝";
  return `${prefix} ${short}`;
}

function isLikelyUrl(v) {
  return /^https?:\/\/\S+/i.test(v || "");
}

export function AppShell({
  title,
  subtitle,
  statusText,
  state,
  onChangeTopic,
  onChangeAudience, // ✅
  onChangePlatform,
  onChangeFormat,
  onChangeCharacteristic,
  onAddSource,
  onRemoveSource,
  onGenerate,
  generated,
}) {
  const platform = state?.platform || "instagram";
  const format = state?.format || "feed";
  const characteristic = state?.characteristic || "educational";

  // fontes podem vir como string[] ou {type,value}[]
  const rawSources = Array.isArray(state?.sources) ? state.sources : [];
  const sources = useMemo(() => {
    return rawSources.map((s) => {
      if (typeof s === "string") {
        return { type: isLikelyUrl(s) ? "link" : "text", value: s };
      }
      return { type: s?.type || (isLikelyUrl(s?.value) ? "link" : "text"), value: s?.value || "" };
    });
  }, [rawSources]);

  const canUseSources =
    typeof onAddSource === "function" && typeof onRemoveSource === "function";

  const [sourceInput, setSourceInput] = useState("");
  const [sourceHint, setSourceHint] = useState("");

  // ---------- PÚBLICO-ALVO (ÚNICO) ----------
  const didInitAudienceRef = useRef(false);
  const [audiencePreset, setAudiencePreset] = useState("");
  const [audienceText, setAudienceText] = useState("");

  // preenche 1x com o que já veio do state (se existir)
  useEffect(() => {
    if (didInitAudienceRef.current) return;
    const existing = (state?.audience || "").trim();
    if (existing) setAudienceText(existing);
    didInitAudienceRef.current = true;
  }, [state?.audience]);

  const audienceFinal = useMemo(() => {
    return (audienceText || "").trim() || (audiencePreset || "").trim() || "";
  }, [audienceText, audiencePreset]);

  useEffect(() => {
    if (typeof onChangeAudience === "function") {
      onChangeAudience(audienceFinal);
    }
  }, [audienceFinal, onChangeAudience]);
  // -----------------------------------------

  const sourcesCountText = useMemo(() => {
    const n = sources.length || 0;
    if (n === 0) return "Nenhuma fonte adicionada ainda.";
    if (n === 1) return "Base carregada: 1 fonte.";
    return `Base carregada: ${n} fontes.`;
  }, [sources.length]);

  const characteristicHint = useMemo(() => {
    return (CHARACTERISTICS.find((c) => c.id === characteristic) || {}).hint || "";
  }, [characteristic]);

  const formatsByPlatform = {
    instagram: [
      { id: "feed", name: "Feed Post", ratio: "1:1" },
      { id: "stories", name: "Stories", ratio: "9:16" },
      { id: "reels", name: "Reels", ratio: "9:16" },
      { id: "carrossel", name: "Carrossel", ratio: "1:1" },
    ],
    twitter: [
      { id: "tweet", name: "Tweet", ratio: "16:9" },
      { id: "thread", name: "Thread", ratio: "16:9" },
    ],
    linkedin: [
      { id: "post", name: "Post", ratio: "1.91:1" },
      { id: "article", name: "Artigo", ratio: "1.91:1" },
    ],
  };

  const platforms = [
    { id: "instagram", name: "Instagram" },
    { id: "twitter", name: "Twitter/X" },
    { id: "linkedin", name: "LinkedIn" },
  ];

  const formats = formatsByPlatform[platform] || formatsByPlatform.instagram;

  function tryAddSource(value) {
    if (!canUseSources) return;

    const trimmed = (value || "").trim();
    if (!trimmed) {
      setSourceHint("Cole um link ou texto antes de adicionar.");
      return;
    }

    // mantém compatibilidade: manda string pro handler e deixa o pai decidir como armazenar
    onAddSource(trimmed);
    setSourceInput("");
    setSourceHint("Fonte adicionada ✅");
    setTimeout(() => setSourceHint(""), 1200);
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ marginTop: 6, color: "#555" }}>{subtitle}</p>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 14,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <h2 style={{ marginTop: 0 }}>⚡ Criar Conteúdo</h2>

        {/* O QUE QUER FALAR */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
            Sobre o que você quer postar?
          </div>
          <input
            value={state?.topic || ""}
            onChange={(e) => onChangeTopic(e.target.value)}
            placeholder="Ex: Bitcoin bateu nova máxima histórica"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ddd",
              outline: "none",
            }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            {statusText}
          </div>
        </div>

        {/* PÚBLICO-ALVO (ÚNICO) ✅ */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
            Com quem esse conteúdo vai falar? (público-alvo)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select
              value={audiencePreset}
              onChange={(e) => setAudiencePreset(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
                outline: "none",
                background: "#fff",
                fontWeight: 700,
              }}
            >
              {AUDIENCE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <input
              value={audienceText}
              onChange={(e) => setAudienceText(e.target.value)}
              placeholder='Ou escreva algo específico (ex: "donas de loja de roupa no Instagram")'
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Dica: quanto mais específico, mais a IA acerta o vocabulário, exemplos e ganchos.
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Selecionado: <b>{audienceFinal || "—"}</b>
          </div>
        </div>

        {/* QUAL A BASE (FONTES) */}
        <div style={{ marginTop: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
            Qual a base? (fontes)
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={sourceInput}
              onChange={(e) => {
                setSourceInput(e.target.value);
                if (sourceHint) setSourceHint("");
              }}
              placeholder="Cole um link (YouTube/site/thread) ou um texto-base…"
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
                outline: "none",
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                tryAddSource(sourceInput);
              }}
            />

            <button
              type="button"
              onClick={() => tryAddSource(sourceInput)}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e5e5e5",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 800,
              }}
              title="Adicionar fonte"
            >
              + Add
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            {sourcesCountText}{" "}
            <span style={{ color: "#777" }}>
              (Dica: aperta <b>Enter</b> pra adicionar rápido.)
            </span>
          </div>

          {sourceHint ? (
            <div style={{ marginTop: 6, fontSize: 12, color: "#2563eb", fontWeight: 700 }}>
              {sourceHint}
            </div>
          ) : null}

          {sources?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {sources.map((s, idx) => (
                <span
                  key={`${s?.value || "src"}-${idx}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(16,185,129,0.10)",
                    border: "1px solid rgba(16,185,129,0.25)",
                  }}
                  title={s?.value}
                >
                  {formatSourcePillLabel(s)}
                  {canUseSources ? (
                    <button
                      type="button"
                      onClick={() => onRemoveSource(idx)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontWeight: 900,
                        color: "#065f46",
                      }}
                      aria-label="Remover fonte"
                      title="Remover"
                    >
                      ×
                    </button>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* QUAL O TOM (PERSONALIDADE) */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
            Qual o tom? (personalidade)
          </div>

          <select
            value={characteristic}
            onChange={(e) => onChangeCharacteristic?.(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ddd",
              outline: "none",
              background: "#fff",
              fontWeight: 700,
            }}
          >
            {CHARACTERISTICS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            {characteristicHint}
          </div>
        </div>

        {/* PLATAFORMA + FORMATO */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: "#444", marginBottom: 8 }}>Plataforma</div>
            <div style={{ display: "grid", gap: 8 }}>
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onChangePlatform(p.id)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 12,
                    border: p.id === platform ? "2px solid #7c3aed" : "1px solid #e5e5e5",
                    background: p.id === platform ? "rgba(124,58,237,0.06)" : "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#444", marginBottom: 8 }}>Formato</div>
            <div style={{ display: "grid", gap: 8 }}>
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onChangeFormat(f.id)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 12,
                    border: f.id === format ? "2px solid #7c3aed" : "1px solid #e5e5e5",
                    background: f.id === format ? "rgba(124,58,237,0.06)" : "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <div>{f.name}</div>
                  <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>{f.ratio}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onGenerate}
          style={{
            width: "100%",
            marginTop: 14,
            padding: 14,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            color: "#fff",
            background: "linear-gradient(90deg, #7c3aed, #2563eb)",
          }}
        >
          ✈️ Gerar Conteúdo
        </button>
      </div>

      {/* GRID FINAL */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        {/* Preview */}
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #eee",
            background: "linear-gradient(135deg,#7c3aed 0%,#10b981 100%)",
            height: 360,
            position: "relative",
            color: "#fff",
          }}
        >
          <div style={{ padding: 16, fontWeight: 900, opacity: 0.9 }}>XaviXica</div>

          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ textAlign: "center", padding: 18 }}>
              <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.05 }}>
                {generated?.designElements?.headline || "Headline"}
              </div>
              <div style={{ opacity: 0.9, marginTop: 10 }}>
                {generated?.designElements?.subheadline || "Subheadline"}
              </div>
              <div style={{ opacity: 0.75, marginTop: 14, fontSize: 12 }}>
                {FormatLabel(format)} • {PlatformLabel(platform)}
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 12, opacity: 0.75 }}>
            Preview (mock) — próxima etapa: render real com conteúdo gerado.
          </div>
        </div>

        {/* Resultado */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 14,
            padding: 18,
          }}
        >
          <h3 style={{ marginTop: 0 }}>🧾 Conteúdo gerado</h3>

          {!generated ? (
            <div style={{ color: "#666", fontSize: 14 }}>
              Clique em <b>“Gerar Conteúdo”</b> para ver o output (fake) no formato final do agente.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Título</div>
                <div style={{ fontWeight: 800 }}>{generated.title}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Copy</div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                  {generated.copy}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Hashtags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {generated.hashtags?.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 12,
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "rgba(124,58,237,0.08)",
                        border: "1px solid rgba(124,58,237,0.18)",
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#666" }}>Melhor horário</div>
                  <div style={{ fontWeight: 700 }}>{generated.bestTime}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#666" }}>Métricas esperadas</div>
                  <div style={{ fontWeight: 700 }}>
                    Eng.: {generated.expectedMetrics?.engagement} • Alc.:{" "}
                    {generated.expectedMetrics?.reach}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#666" }}>CTA</div>
                <div style={{ fontWeight: 700 }}>{generated.cta}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Direção de design</div>
                <div style={{ color: "#333" }}>{generated.designElements?.layout}</div>
                <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
                  {generated.designElements?.visualConcept}
                </div>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Meta do conteúdo: <b>{CharacteristicLabel(characteristic)}</b>
                {audienceFinal ? (
                  <>
                    {" "}• Público: <b>{audienceFinal}</b>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
