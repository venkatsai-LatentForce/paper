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

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Adds the `in` class once the element scrolls into view (pairs with `.reveal`).
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// Rolls a displayed number toward `value` instead of jumping (e.g. portfolio value).
export function useTween(value, ms = 700) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (value == null) return;
    const start = from.current ?? 0;
    if (reducedMotion() || start === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min((t - t0) / ms, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = start + (value - start) * eased;
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

// "tick-up" / "tick-down" for a moment whenever `value` moves.
export function useTickDirection(value) {
  const [dir, setDir] = useState("");
  const last = useRef(value);
  useEffect(() => {
    if (value == null || last.current == null || value === last.current) {
      last.current = value;
      return;
    }
    setDir(value > last.current ? "tick-up" : "tick-down");
    last.current = value;
    const id = setTimeout(() => setDir(""), 700);
    return () => clearTimeout(id);
  }, [value]);
  return dir;
}
