import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, token } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token.get()));

  const refresh = useCallback(async () => {
    if (!token.get()) return setUser(null);
    try {
      setUser(await api("/me"));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [refresh]);

  const authenticate = async (path, body) => {
    const { access_token } = await api(path, { method: "POST", body });
    token.set(access_token);
    await refresh();
  };

  const value = {
    user,
    loading,
    refresh,
    setUser,
    login: (email, password) => authenticate("/auth/login", { email, password }),
    register: (form) => authenticate("/auth/register", form),
    logout: () => {
      token.clear();
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
