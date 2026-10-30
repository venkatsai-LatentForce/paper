import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel.jsx";
import BrandMark from "../components/BrandMark.jsx";
import { ErrorText } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

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

function AuthCard({ title, lead, children, alt }) {
  return (
    <div className="auth-split">
      <main className="auth-side">
        <Link to="/" className="brand"><BrandMark />Paper Trade</Link>
        <div className="auth-box">
          <h1>{title}</h1>
          <p className="muted">{lead}</p>
          {children}
          <p className="auth-alt">{alt}</p>
        </div>
        <p className="auth-legal">Practice money only. No real orders are placed.</p>
      </main>
      <AuthPanel />
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { submit, error, busy } = useSubmit(() => login(email, password));

  return (
    <AuthCard title="Log in" lead="Pick up where you left off."
      alt={<>New here? <Link to="/register">Create an account</Link></>}>
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
        <button className="primary btn-block btn-lg btn-arrow" disabled={busy} aria-busy={busy}>
          {busy ? <><span className="spinner" />Logging in…</> : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const { submit, error, busy } = useSubmit(() => register(form));

  return (
    <AuthCard title="Create your practice account" lead="Practice money only. No real funds, ever."
      alt={<>Already have an account? <Link to="/login">Log in</Link></>}>
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
          <label htmlFor="password">Password (at least 8 characters)</label>
          <input id="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={set("password")} />
        </div>
        <p className="start-note">
          Your practice account is ready to trade as soon as you sign up. Top it up from the dashboard any time.
        </p>
        <ErrorText>{error}</ErrorText>
        <button className="primary btn-block btn-lg btn-arrow" disabled={busy} aria-busy={busy}>
          {busy ? <><span className="spinner" />Creating account…</> : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
