// Thin fetch wrapper: adds the JWT, parses JSON, throws readable errors.
const TOKEN_KEY = "paper_token";

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function errorMessage(body, status) {
  const d = body?.detail;
  if (typeof d === "string") return d;
  // FastAPI validation errors: [{loc, msg}, ...]
  if (Array.isArray(d)) return d.map((e) => `${e.loc.at(-1)}: ${e.msg}`).join("; ");
  return `Request failed (${status})`;
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const t = token.get();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (res.status === 401 && t) {
    token.clear();
    window.dispatchEvent(new Event("auth:logout"));
  }
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status);
  return data;
}
