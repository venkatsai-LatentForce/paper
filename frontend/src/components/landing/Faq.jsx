const FAQ = [
  ["Can I lose real money?", "No. Orders are filled inside Paper Trade and never sent to an exchange, and there's no way to deposit real funds."],
  ["Do I need a Zerodha account?", "Not to start. You can practise on simulated prices straight away. For live prices you'll need a Kite Connect app, which needs a Zerodha account."],
  ["Why is the balance capped at ₹10,00,000?", "To keep practice realistic. You start with ₹1,00,000 and can add more from your dashboard until lifetime deposits reach ₹10,00,000. Past that, only profitable trading grows your balance."],
  ["How are futures and options handled?", "In lots, like the real market. Futures block 15% of the contract value as margin; options cost the full premium."],
  ["Why do I reconnect Kite every day?", "Kite access tokens expire at 6 AM IST each day. That's Zerodha's rule, and reconnecting takes a few seconds."],
  ["Is it free?", "Yes. There's no payment step anywhere in Paper Trade."],
];

export default function Faq() {
  return (
    <div className="faq">
      {FAQ.map(([q, a], i) => (
        <details key={q} style={{ "--i": i }}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
