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

  const statusText = useMemo(() => {
    if (!state?.topic?.trim()) return "Digite um tema pra começar.";
    return `Pronto pra gerar: ${state.topic}`;
  }, [state?.topic]);

  async function handleGenerate() {
    try {
      setGenerated(null);

      const payload = {
        topic: state.topic,
        audience: state.audience,
        ctaDesired: state.cta,
        platform: state.platform,
        format: state.format,
        characteristic: state.characteristic,
        sources: state.sources,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 👇 não assume JSON (porque Vercel às vezes manda HTML em erro)
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = { error: "Resposta não-JSON do servidor", detail: raw?.slice(0, 800) };
      }

      if (!res.ok) {
        console.error("API error:", data);
        alert(`${data?.error || "Erro ao gerar conteúdo"}\n\n${data?.detail || ""}`);
        return;
      }

      setGenerated(data);
    } catch (err) {
      console.error(err);
      alert(`Falha ao chamar a API\n\n${String(err?.message || err)}`);
    }
  }

  return (
    <AppShell
      title="Agente de Criação de Conteúdo"
      subtitle="Agente de IA para creators: criar, planejar e escalar sua produção de conteúdo"
      statusText={statusText}
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
