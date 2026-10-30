import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api/client.js";

// Fetch `path` on mount (and every `intervalMs`, if given). Pass null to skip.
export function useApi(path, intervalMs) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const current = useRef(path);
  current.current = path;

  const load = useCallback(async () => {
    if (!path) return;
    try {
      const result = await api(path);
      if (current.current === path) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (current.current === path) setError(e.message);
    } finally {
      if (current.current === path) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    setLoading(Boolean(path));
    load();
    if (!path || !intervalMs) return;
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [path, intervalMs, load]);

  return { data, error, loading, reload: load };
}

export const PRICE_REFRESH_MS = 5000;
