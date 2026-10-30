import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { money } from "../format.js";
import BrandMark from "./BrandMark.jsx";

const LINKS = [
  ["/dashboard", "Dashboard", "1"],
  ["/explore", "Explore", "2"],
  ["/holdings", "Holdings", "3"],
  ["/orders", "Orders", "4"],
  ["/connect", "Connect", "5"],
];

const typing = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

// 1–5 jump between pages; "/" opens search. Ignored while typing in a field.
function useShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(document.activeElement)) return;
      const link = LINKS.find(([, , key]) => key === e.key);
      if (link) {
        e.preventDefault();
        navigate(link[0]);
      } else if (e.key === "/") {
        e.preventDefault();
        const search = document.getElementById("instrument-search");
        if (search) search.focus();
        else navigate("/explore");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
}

// IST clock and whether it's inside regular NSE hours (Mon–Fri 09:15–15:30; exchange holidays not included).
function useMarketClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(now).map((p) => [p.type, p.value])
  );
  const mins = Number(parts.hour) * 60 + Number(parts.minute);
  const weekday = !["Sat", "Sun"].includes(parts.weekday);
  return { time: `${parts.hour}:${parts.minute}:${parts.second}`, open: weekday && mins >= 555 && mins < 930 };
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const clock = useMarketClock();
  useShortcuts();

  return (
    <div className="app">
      <a href="#main" className="skip">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/dashboard" className="brand"><BrandMark />Paper Trade</NavLink>
          <nav aria-label="Main" className="tabs">
            {LINKS.map(([to, label, key]) => (
              <NavLink key={to} to={to}>
                {label}<kbd aria-hidden="true">{key}</kbd>
              </NavLink>
            ))}
          </nav>
          <div className="topbar-right">
            <span className="cash">
              <span className="label">Cash</span>
              <span className="num">{money(user.cash)}</span>
            </span>
            <button className="btn-quiet btn-sm" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>

      {/* Keyed by path so each page settles in on navigation. */}
      <main id="main" className="container page" key={pathname}>{children}</main>

      <footer className="statusbar" aria-label="Status">
        <span className={`status ${clock.open ? "status-live" : ""}`}>
          <i aria-hidden="true" />NSE {clock.open ? "regular hours" : "closed"}
        </span>
        <span className="num statusbar-clock">{clock.time} IST</span>
        <span className="statusbar-spacer" />
        <span className="statusbar-keys hide-sm">
          <span><kbd>1</kbd>–<kbd>5</kbd> pages</span>
          <span><kbd>/</kbd> search</span>
        </span>
        <span className="hide-sm">Practice money only</span>
      </footer>
    </div>
  );
}
