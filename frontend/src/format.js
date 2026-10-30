const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (n) => inr.format(n ?? 0);

export const signedMoney = (n) => (n > 0 ? "+" : "") + inr.format(n ?? 0);

export const pct = (n) => `${n > 0 ? "+" : ""}${(n ?? 0).toFixed(2)}%`;

// CSS class for a profit/loss number.
export const tone = (n) => (n > 0 ? "up" : n < 0 ? "down" : "");

export const dateTime = (iso) =>
  new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const TYPE_LABEL = { EQ: "Stock", FUT: "Future", CE: "Call", PE: "Put" };
