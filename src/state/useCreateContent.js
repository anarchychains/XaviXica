import { useEffect, useRef, useState } from "react";
import { storage } from "../lib/storage";

const DEFAULT_STATE = {
  topic: "",
  platform: "instagram",
  format: "feed",
  characteristic: "educational",
  sources: [],
};

export function useCreateContent() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef(null);

  // Carregar do storage quando abre o app
  useEffect(() => {
    let alive = true;

    storage
      .get("create-content-state")
      .then((res) => {
        if (!alive) return;

        if (res?.value) {
          try {
            const parsed = JSON.parse(res.value);
            setState({
              ...DEFAULT_STATE,
              ...parsed,
              // garante array mesmo se vier zoado
              sources: Array.isArray(parsed?.sources) ? parsed.sources : [],
            });
          } catch {
            setState(DEFAULT_STATE);
          }
        } else {
          setState(DEFAULT_STATE);
        }
      })
      .finally(() => {
        if (alive) setHydrated(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Salvar com debounce
  useEffect(() => {
    if (!hydrated) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      storage.set("create-content-state", JSON.stringify(state));
    }, 400);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state, hydrated]);

  const setTopic = (topic) => setState((s) => ({ ...s, topic }));
  const setPlatform = (platform) => setState((s) => ({ ...s, platform }));
  const setFormat = (format) => setState((s) => ({ ...s, format }));
  const setCharacteristic = (characteristic) => setState((s) => ({ ...s, characteristic }));

  const addSource = (value) => {
    const v = (value || "").trim();
    if (!v) return;

    setState((s) => {
      const sources = Array.isArray(s.sources) ? s.sources : [];
      // evita duplicados exatos (simples e eficiente)
      if (sources.includes(v)) return s;
      return { ...s, sources: [...sources, v] };
    });
  };

  const removeSource = (index) => {
    setState((s) => {
      const sources = Array.isArray(s.sources) ? s.sources : [];
      if (index < 0 || index >= sources.length) return s;
      return { ...s, sources: sources.filter((_, i) => i !== index) };
    });
  };

  const reset = () => setState(DEFAULT_STATE);

  return {
    state,
    hydrated,
    setTopic,
    setPlatform,
    setFormat,
    setCharacteristic,
    addSource,
    removeSource,
    reset,
  };
}
