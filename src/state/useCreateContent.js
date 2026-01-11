import { useEffect, useState } from "react";
import { storage } from "../lib/storage";

const DEFAULT_STATE = {
  topic: "",
  platform: "instagram",
  format: "feed",
};

export function useCreateContent() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Carrega do storage quando abre o app
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

  // Salva no storage sempre que mudar
  useEffect(() => {
    if (!hydrated) return;
    storage.set("create-content-state", JSON.stringify(state));
  }, [state, hydrated]);

  const setTopic = (topic) => setState((s) => ({ ...s, topic }));
  const setPlatform = (platform) => setState((s) => ({ ...s, platform }));
  const setFormat = (format) => setState((s) => ({ ...s, format }));

  const reset = () => setState(DEFAULT_STATE);

  return {
    state,
    hydrated,
    setTopic,
    setPlatform,
    setFormat,
    reset,
  };
}
