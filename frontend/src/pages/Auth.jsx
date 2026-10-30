import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorText } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const MAX_START = 1000000;

function useSubmit(action) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await action();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  return { submit, error, busy };
}

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { submit, error, busy } = useSubmit(() => login(email, password));

  return (
    <div className="auth-box card">
      <h1>Log in</h1>
      <p className="muted small">Welcome back to Paper Trade.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <ErrorText>{error}</ErrorText>
        <button className="primary btn-block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="small muted" style={{ marginTop: 16 }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", starting_balance: "100000" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const { submit, error, busy } = useSubmit(() =>
    register({ ...form, starting_balance: Number(form.starting_balance) })
  );

  return (
    <div className="auth-box card">
      <h1>Create account</h1>
      <p className="muted small">Practice money only — no real funds, ever.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" autoComplete="name" required value={form.name} onChange={set("name")} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
        </div>
        <div className="field">
          <label htmlFor="password">Password (min 8 characters)</label>
          <input id="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={set("password")} />
        </div>
        <div className="field">
          <label htmlFor="bal">Starting balance (₹, up to 10,00,000)</label>
          <input id="bal" type="number" min="1" max={MAX_START} step="1" required value={form.starting_balance} onChange={set("starting_balance")} />
        </div>
        <ErrorText>{error}</ErrorText>
        <button className="primary btn-block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="small muted" style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
