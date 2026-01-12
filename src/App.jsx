import React, { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { useCreateContent } from "./state/useCreateContent";

export default function App() {
  const {
    state,
    setTopic,
    setAudience,
    setCta,
    setPlatform,
    setFormat,
    setCharacteristic,
    addSource,
    removeSource,
  } = useCreateContent();

  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusText = useMemo(() => {
    if (!state?.topic?.trim()) return "Digite um tema pra começar.";
    return `Pronto pra gerar: ${state.topic}`;
  }, [state?.topic]);

  async function handleGenerate() {
    try {
      setLoading(true);
      setGenerated(null);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: state.topic,
          audience: state.audience,
          ctaDesired: state.cta,
          platform: state.platform,
          format: state.format,
          characteristic: state.characteristic,
          sources: state.sources,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        alert(data?.error || "Erro ao gerar conteúdo");
        return;
      }

      setGenerated(data);
    } catch (err) {
      console.error(err);
      alert("Falha ao chamar a API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Agente de Criação de Conteúdo"
      subtitle="Agente de IA para creators: criar, planejar e escalar sua produção de conteúdo"
      statusText={loading ? "Gerando conteúdo com IA…" : statusText}
      state={state}
      onChangeTopic={setTopic}
      onChangeAudience={setAudience}
      onChangeCta={setCta}
      onChangePlatform={setPlatform}
      onChangeFormat={setFormat}
      onChangeCharacteristic={setCharacteristic}
      onAddSource={addSource}
      onRemoveSource={removeSource}
      onGenerate={handleGenerate}
      generated={generated}
    />
  );
}
