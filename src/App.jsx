import React, { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { useCreateContent } from "./state/useCreateContent";
import { generateFakeContent } from "./generators/fakeContentGenerator";

export default function App() {
  const { state, setTopic, setPlatform, setFormat } = useCreateContent();
  const [generated, setGenerated] = useState(null);

  const statusText = useMemo(() => {
    if (!state?.topic?.trim()) return "Digite um tema pra começar.";
    return `Pronto pra gerar: ${state.topic}`;
  }, [state?.topic]);

  function handleGenerate() {
    const content = generateFakeContent({
      topic: state.topic,
      platform: state.platform,
      format: state.format,
    });

    setGenerated(content);
  }

  return (
    <AppShell
      title="Agente de Criação de Conteúdo"
      subtitle="Agente de IA para creators: criar, planejar e escalar sua produção de conteúdo"
      statusText={statusText}
      state={state}
      onChangeTopic={setTopic}
      onChangePlatform={setPlatform}
      onChangeFormat={setFormat}
      onGenerate={handleGenerate}
      generated={generated}
    />
  );
}
