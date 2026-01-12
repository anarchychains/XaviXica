import { useEffect, useRef, useState } from "react";
import { storage } from "../lib/storage";

const DEFAULT_STATE = {
  topic: "",
  audience: "",
  cta: "", // ✅ NOVO
  platform: "instagram",
  format: "feed",
  characteristic: "educational",
  sources: [], // [{ type, value }]
};

function detectSourceType(value) {
  const v = (value || "").trim();
  if (!v) return "text";

  const looksLikeUrl =
    /^https?:\/\/\S+/i.test(v) || /^www\.\S+/i.test(v) || /\.\w{2,}\/\S*/.test(v);

  return looksLikeUrl ? "link" : "text";
}

function normalizeSources(rawSources) {
  if (!Array.isArray(rawSources)) return [];

  return rawSources
    .map((item) => {
      if (!item) return null;

      if (typeof item === "object" && item.value) {
        return {
          type: item.type || detectSourceType(item.value),
          value: String(item.value).trim(),
        };
      }

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

            next.sources = normalizeSources(parsed?.sources);

            next.audience = typeof parsed?.audience === "string" ? parsed.audience : "";
            next.cta = typeof parsed?.cta === "string" ? parsed.cta : ""; // ✅ NOVO

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
  const setAudience = (audience) => setState((s) => ({ ...s, audience }));
  const setCta = (cta) => setState((s) => ({ ...s, cta })); // ✅ NOVO
  const setPlatform = (platform) => setState((s) => ({ ...s, platform }));
  const setFormat = (format) => setState((s) => ({ ...s, format }));
  const setCharacteristic = (characteristic) => setState((s) => ({ ...s, characteristic }));

  const addSource = (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) return;

    const type = detectSourceType(value);

    setState((s) => {
      const sources = normalizeSources(s.sources);
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
    setAudience,
    setCta, // ✅ NOVO
    setPlatform,
    setFormat,
    setCharacteristic,
    addSource,
    removeSource,
    reset,
  };
}
