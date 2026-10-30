import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { money } from "../format.js";

const LINKS = [
  ["/dashboard", "Dashboard"],
  ["/explore", "Explore"],
  ["/holdings", "Holdings"],
  ["/orders", "Orders"],
  ["/connect", "Connect"],
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/dashboard" className="brand">Paper Trade</NavLink>
          <nav>
            {LINKS.map(([to, label]) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
          </nav>
          <div className="topbar-right">
            <span className="muted small" title="Available cash">{money(user.cash)}</span>
            <button className="link" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
