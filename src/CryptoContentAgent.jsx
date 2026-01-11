import React from "react";
import { useCreateContent } from "./state/useCreateContent";

const PLATFORMS = [
  { id: "instagram", name: "Instagram" },
  { id: "twitter", name: "Twitter/X" },
  { id: "linkedin", name: "LinkedIn" },
];

const FORMATS_BY_PLATFORM = {
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

export default function CryptoContentAgent() {
  const { state, hydrated, setTopic, setPlatform, setFormat } =
    useCreateContent();

  const formats = FORMATS_BY_PLATFORM[state.platform] || [];
  const selectedFormat =
    formats.find((f) => f.id === state.format) || formats[0];

  // Se o formato atual não existir na plataforma, corrige automaticamente
  React.useEffect(() => {
    if (!hydrated) return;
    if (!formats.length) return;

    const exists = formats.some((f) => f.id === state.format);
    if (!exists) setFormat(formats[0].id);
  }, [hydrated, state.platform]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = () => {
    // Por enquanto: só prova que o "cérebro" está funcionando
    console.log("Gerar conteúdo com:", {
      topic: state.topic,
      platform: state.platform,
      format: state.format,
    });

    alert(
      `✅ Estado OK!\n\nTema: ${state.topic || "(vazio)"}\nPlataforma: ${
        state.platform
      }\nFormato: ${state.format}\n\nPróximo passo: ligar a IA.`
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#f5f3ff,#eff6ff)",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h1 style={{ fontSize: 36, margin: 0 }}>
            ✨ Agente de Criação de Conteúdo
          </h1>
          <p style={{ marginTop: 8, color: "#4b5563" }}>
            Agente de IA para creators: crie, planeje e escale sua produção de
            conteúdo.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 18,
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ marginTop: 0 }}>⚡ Criar Conteúdo</h2>

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 13, color: "#374151" }}>
              Sobre o que você quer postar?
            </label>
            <input
              value={state.topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Bitcoin bateu nova máxima histórica"
              style={{
                width: "100%",
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginTop: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Plataforma
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {PLATFORMS.map((p) => {
                  const active = state.platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      style={{
                        textAlign: "left",
                        padding: 12,
                        borderRadius: 12,
                        border: `2px solid ${active ? "#7c3aed" : "#e5e7eb"}`,
                        background: active ? "#f5f3ff" : "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Formato
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {formats.map((f) => {
                  const active = state.format === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      style={{
                        textAlign: "left",
                        padding: 12,
                        borderRadius: 12,
                        border: `2px solid ${active ? "#7c3aed" : "#e5e7eb"}`,
                        background: active ? "#f5f3ff" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {f.ratio}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!hydrated}
            style={{
              width: "100%",
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              border: "none",
              cursor: hydrated ? "pointer" : "not-allowed",
              fontWeight: 800,
              color: "#fff",
              background:
                "linear-gradient(90deg, rgba(124,58,237,1), rgba(59,130,246,1))",
              opacity: hydrated ? 1 : 0.6,
            }}
          >
            ✈️ Gerar Conteúdo
          </button>

          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              background:
                "linear-gradient(135deg, rgba(124,58,237,1), rgba(16,185,129,1))",
              color: "#fff",
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18 }}>XaviXica</div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 900 }}>Headline</div>
              <div style={{ opacity: 0.9, marginTop: 8 }}>
                {selectedFormat
                  ? `${selectedFormat.name} • ${selectedFormat.ratio}`
                  : ""}
              </div>
            </div>

            <div style={{ opacity: 0.9, fontSize: 13 }}>
              Preview (mock) — próxima etapa: render com conteúdo gerado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
