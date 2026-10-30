import { NavLink, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/dashboard" className="brand"><span className="brand-mark" />Paper Trade</NavLink>
          <nav aria-label="Main">
            {LINKS.map(([to, label]) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
          </nav>
          <div className="topbar-right">
            <span className="cash-pill">
              <span className="eyebrow">Cash</span>
              <span className="num">{money(user.cash)}</span>
            </span>
            <button className="link small" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>
      {/* Keyed by path so each page fades in on navigation. */}
      <main className="container page" key={pathname}>{children}</main>
    </>
  );
}
