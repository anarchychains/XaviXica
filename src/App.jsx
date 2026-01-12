import React, { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { useCreateContent } from "./state/useCreateContent";
import { generateFakeContent } from "./generators/fakeContentGenerator";

export default function App() {
  const {
    state,
    setTopic,
    setAudience,
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

  function handleGenerate() {
    const content = generateFakeContent({
      topic: state.topic,
      audience: state.audience, // ✅ novo
      platform: state.platform,
      format: state.format,
      characteristic: state.characteristic, // ✅ novo
      sources: state.sources, // ✅ novo
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
      onChangeAudience={setAudience} // ✅
      onChangePlatform={setPlatform}
      onChangeFormat={setFormat}
      onChangeCharacteristic={setCharacteristic} // ✅
      onAddSource={addSource} // ✅
      onRemoveSource={removeSource} // ✅
      onGenerate={handleGenerate}
      generated={generated}
    />
  );
}
