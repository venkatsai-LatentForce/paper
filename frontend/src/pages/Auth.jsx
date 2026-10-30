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

function AuthCard({ title, lead, children, alt }) {
  return (
    <div className="auth-wrap">
      <div className="auth-box card">
        <Link to="/" className="brand"><span className="brand-mark" />Paper Trade</Link>
        <h1>{title}</h1>
        <p className="muted">{lead}</p>
        {children}
        <p className="auth-alt">{alt}</p>
      </div>
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
        <button className="primary btn-block btn-lg" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
    </AuthCard>
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
        <div className="field">
          <label htmlFor="bal">Starting balance in ₹ (up to 10,00,000)</label>
          <input id="bal" type="number" min="1" max={MAX_START} step="1" required value={form.starting_balance} onChange={set("starting_balance")} />
        </div>
        <ErrorText>{error}</ErrorText>
        <button className="primary btn-block btn-lg" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
    </AuthCard>
  );
}
