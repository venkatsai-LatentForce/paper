import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { ErrorText, PageHead } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { dateTime } from "../format.js";
import { useApi } from "../hooks.js";

// The API key/secret are held in sessionStorage only for the round trip to
// Kite's login page, then removed. The secret is never stored by the server.
const PENDING = "kite_pending";

export default function Connect() {
  const { refresh } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = useApi("/kite/status");
  const [form, setForm] = useState({ api_key: "", api_secret: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const exchanged = useRef(false);

  const s = status.data;
  const redirectUrl = `${window.location.origin}/connect`;

  // Step 2: Kite redirected back with ?request_token=...
  useEffect(() => {
    const requestToken = params.get("request_token");
    if (!requestToken || exchanged.current) return;
    exchanged.current = true;
    const pending = JSON.parse(sessionStorage.getItem(PENDING) || "{}");
    sessionStorage.removeItem(PENDING);
    setParams({}, { replace: true });
    if (params.get("status") !== "success") {
      setError("Kite login was cancelled.");
      return;
    }
    setBusy(true);
    api("/kite/connect", { method: "POST", body: { ...pending, request_token: requestToken } })
      .then((r) => {
        setMessage(`Connected as ${r.user_name ?? "your Kite account"}. Prices are now live.`);
        status.reload();
        refresh();
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, [params, setParams, status, refresh]);

  // Step 1: send the user to Kite's login page.
  const startLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { url } = await api(`/kite/login-url?api_key=${encodeURIComponent(form.api_key)}`);
      sessionStorage.setItem(PENDING, JSON.stringify(form));
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    }
  };

  const disconnect = async () => {
    await api("/kite", { method: "DELETE" });
    setMessage("Disconnected. Using simulated prices.");
    status.reload();
    refresh();
  };

  return (
    <div className="stack" style={{ maxWidth: 620 }}>
      <PageHead eyebrow="Live prices" title="Connect Kite">
        Link your own Zerodha Kite Connect app to trade at live market prices.
        Until then, the app uses simulated prices so you can practise right away.
      </PageHead>

      {message && <p className="success">{message}</p>}
      <ErrorText>{error}</ErrorText>
      {busy && <p className="muted small">Connecting to Kite…</p>}

      {s?.connected ? (
        <div className="card">
          <div className="spread">
            <div>
              <h2>Connected</h2>
              <p className="muted small">
                {s.user_name && <>Kite user {s.user_name} · </>}
                since {dateTime(s.connected_at)}. Kite sessions end at 6 AM IST; reconnect daily.
              </p>
            </div>
            <button onClick={disconnect}>Disconnect</button>
          </div>
        </div>
      ) : s && (
        <form className="card" onSubmit={startLogin}>
          <h2>Link your Kite Connect app</h2>
          <ol className="muted small" style={{ paddingLeft: 18, margin: "0 0 var(--s-5)", lineHeight: 1.9 }}>
            <li>Create an app at developers.kite.trade.</li>
            <li>Set its redirect URL to <code>{redirectUrl}</code>.</li>
            <li>Enter its API key and secret below and log in with Kite.</li>
          </ol>
          {!s.app_key_configured && (
            <>
              <div className="field">
                <label htmlFor="key">API key</label>
                <input id="key" required value={form.api_key} autoComplete="off"
                  onChange={(e) => setForm({ ...form, api_key: e.target.value.trim() })} />
              </div>
              <div className="field">
                <label htmlFor="secret">API secret</label>
                <input id="secret" type="password" required value={form.api_secret} autoComplete="off"
                  onChange={(e) => setForm({ ...form, api_secret: e.target.value.trim() })} />
              </div>
            </>
          )}
          <button className="primary" disabled={busy}>Log in with Kite</button>
          {s.price_provider === "mock" && (
            <p className="muted small" style={{ marginTop: 12 }}>
              Note: the server is set to PRICE_PROVIDER=mock, so prices stay simulated even when connected.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
