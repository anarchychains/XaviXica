import { useEffect, useRef, useState } from "react";
import { storage } from "../lib/storage";

const DEFAULT_STATE = {
  topic: "",
  platform: "instagram",
  format: "feed",
  characteristic: "educational",
  sources: [], // agora é array de objetos: [{ type, value }]
};

function detectSourceType(value) {
  const v = (value || "").trim();
  if (!v) return "text";

  // detecta link bem simples (sem frescura)
  const looksLikeUrl =
    /^https?:\/\/\S+/i.test(v) || /^www\.\S+/i.test(v) || /\.\w{2,}\/\S*/.test(v);

  return looksLikeUrl ? "link" : "text";
}

function normalizeSources(rawSources) {
  if (!Array.isArray(rawSources)) return [];

  // Migração: se vier ["https://..."] vira [{type:"link", value:"https://..."}]
  return rawSources
    .map((item) => {
      if (!item) return null;

      // já é o formato novo
      if (typeof item === "object" && item.value) {
        return {
          type: item.type || detectSourceType(item.value),
          value: String(item.value).trim(),
        };
      }

      // formato antigo (string)
      if (typeof item === "string") {
        const value = item.trim();
        if (!value) return null;

        return {
          type: detectSourceType(value),
          value,
        };
      }

      return null;
    })
    .filter(Boolean);
}

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

            const next = {
              ...DEFAULT_STATE,
              ...parsed,
            };

            // migração sources
            next.sources = normalizeSources(parsed?.sources);

            setState(next);
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

  // Salvar com debounce (evita salvar a cada tecla e perder foco)
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
  const setCharacteristic = (characteristic) =>
    setState((s) => ({ ...s, characteristic }));

  const addSource = (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) return;

    const type = detectSourceType(value);

    setState((s) => {
      const sources = normalizeSources(s.sources);

      // evita duplicado exato
      const exists = sources.some((x) => x.value === value);
      if (exists) return s;

      return {
        ...s,
        sources: [...sources, { type, value }],
      };
    });
  };

  const removeSource = (index) => {
    setState((s) => {
      const sources = normalizeSources(s.sources);
      if (index < 0 || index >= sources.length) return s;
      return {
        ...s,
        sources: sources.filter((_, i) => i !== index),
      };
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
