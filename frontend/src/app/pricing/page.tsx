"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Minus, ChevronDown, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const TIERS = [
  {
    name: "Trader",
    price: "Free",
    period: "forever",
    tagline: "Everything you need to trade on-chain.",
    cta: { label: "Start trading", href: "/" },
    highlight: false,
    features: [
      "Unlimited trading on all market types",
      "2% protocol fee per trade (on-chain)",
      "PRED rewards for trading & creating",
      "Referral earnings — 0.5% of referee volume",
      "Portfolio tracking & claim dashboard",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    tagline: "For serious forecasters and market makers.",
    cta: { label: "Get Pro", href: "/create" },
    highlight: true,
    features: [
      "Everything in Trader",
      "Advanced analytics & probability history",
      "REST + GraphQL API access (10k req/day)",
      "Fee rebates in PRED (up to 50%)",
      "Priority market resolution queue",
      "Custom market categories",
      "Email support (24h)",
    ],
  },
  {
    name: "Institutional",
    price: "Custom",
    period: "annual contract",
    tagline: "White-label prediction markets for your platform.",
    cta: { label: "Talk to us", href: "https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp/issues" },
    highlight: false,
    features: [
      "Everything in Pro",
      "White-label deployment & branding",
      "Dedicated oracle configuration",
      "Unlimited API access + webhooks",
      "Custom fee structures & revenue share",
      "SLA-backed uptime & dedicated support",
      "Compliance & reporting toolkit",
    ],
  },
];

const FEE_ROWS = [
  { action: "Buy shares (YES/NO, Multi, Scalar, USDC)", fee: "2% of stake", to: "Protocol treasury & stakers" },
  { action: "Claim winnings", fee: "0%", to: "—" },
  { action: "Create a market", fee: "Gas only", to: "—" },
  { action: "Referral payout", fee: "0.5% of referee volume", to: "Paid to referrer in ETH" },
  { action: "PRED staking / unstaking", fee: "Gas only", to: "—" },
];

const FAQS = [
  {
    q: "Why is trading 'free' if there's a 2% fee?",
    a: "The 2% fee is charged by the smart contract at purchase time and funds the protocol treasury and PRED stakers. There is no platform subscription required to trade — the Trader tier costs nothing beyond on-chain fees and gas.",
  },
  {
    q: "Can the fee change?",
    a: "The fee is set per market at creation and is immutable for that market's lifetime. Factory-level fees are capped at 5% by the contract (MAX_FEE_BPS = 500) and any change requires a governance vote.",
  },
  {
    q: "What do Pro fee rebates mean?",
    a: "Pro subscribers accrue PRED rewards equivalent to up to 50% of protocol fees they paid each month, distributed via the rewards contract.",
  },
  {
    q: "Do I need Pro to earn PRED?",
    a: "No. Every trader earns PRED rewards for trading and creating markets. Pro increases reward multipliers and unlocks analytics and API access.",
  },
  {
    q: "Is Verity live on mainnet?",
    a: "Verity currently runs on the Sepolia testnet. Mainnet deployment follows the security roadmap described in our security paper.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(var(--fg-rgb),0.07)" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          padding: "20px 4px", background: "transparent", border: "none", cursor: "pointer",
          color: "var(--text)", fontSize: 15.5, fontWeight: 600, textAlign: "left", fontFamily: "inherit",
        }}
      >
        {q}
        <ChevronDown size={16} color="var(--faint)" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s" }} aria-hidden />
      </button>
      {open && (
        <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.75, margin: "0 0 20px", padding: "0 4px", maxWidth: 640 }}>{a}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 40px" }}>
      {/* Header */}
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Pricing</p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", fontWeight: 500, margin: "0 0 20px", color: "var(--text)" }}>
            Priced like a protocol,<br />not a platform.
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
            Trading is open to everyone with a single on-chain fee. Subscriptions only exist
            for the tools around the market — never for access to the market itself.
          </p>
        </div>
      </Reveal>

      {/* Tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 24, marginBottom: 96, alignItems: "stretch" }}>
        {TIERS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.15} style={{ height: "100%" }}>
            <div
              style={{
                position: "relative", height: "100%", display: "flex", flexDirection: "column",
                borderRadius: 20, padding: "36px 30px",
                border: `1px solid ${t.highlight ? "rgba(var(--accent-rgb),0.45)" : "rgba(var(--fg-rgb),0.09)"}`,
                background: t.highlight ? "linear-gradient(180deg, rgba(var(--accent-rgb),0.07), rgba(var(--accent-rgb),0.02))" : "rgba(var(--fg-rgb),0.03)",
                boxShadow: t.highlight ? "0 12px 48px rgba(var(--accent-rgb),0.12)" : "none",
              }}
            >
              {t.highlight && (
                <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 14px", borderRadius: 999, background: "linear-gradient(135deg,var(--accent),var(--accent-2))", color: "var(--on-accent)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                  MOST POPULAR
                </span>
              )}
              <h2 style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>{t.name}</h2>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span className="font-display" style={{ fontSize: 42, fontWeight: 600, color: "var(--text)" }}>{t.price}</span>
                <span style={{ color: "var(--faint)", fontSize: 13 }}>{t.period}</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>{t.tagline}</p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", flex: 1 }}>
                {t.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--text-2)", fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
                    <Check size={15} color={t.highlight ? "var(--accent)" : "var(--up)"} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={t.cta.href}
                {...(t.cta.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "13px 20px", borderRadius: 12, textDecoration: "none", fontSize: 14.5, fontWeight: 700,
                  background: t.highlight ? "linear-gradient(135deg,var(--accent),var(--accent-2))" : "rgba(var(--fg-rgb),0.06)",
                  color: t.highlight ? "var(--on-accent)" : "var(--text)",
                  border: t.highlight ? "none" : "1px solid rgba(var(--fg-rgb),0.12)",
                }}
              >
                {t.cta.label} <ChevronRight size={15} aria-hidden />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      {/* On-chain fee table */}
      <Reveal>
        <h2 className="font-display" style={{ fontSize: "clamp(1.5rem,2.8vw,2rem)", fontWeight: 500, margin: "0 0 8px", color: "var(--text)" }}>
          On-chain fees, exactly as coded
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14.5, margin: "0 0 28px", maxWidth: 560, lineHeight: 1.7 }}>
          Every fee below is enforced by the smart contracts and visible on Etherscan. Fees are capped at 5% by
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, background: "rgba(var(--fg-rgb),0.06)", padding: "2px 6px", borderRadius: 6, margin: "0 4px" }}>MAX_FEE_BPS</code>
          and cannot be raised beyond it — by anyone.
        </p>
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid rgba(var(--fg-rgb),0.08)", marginBottom: 96 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 560 }}>
            <thead>
              <tr style={{ background: "rgba(var(--fg-rgb),0.04)" }}>
                {["Action", "Fee", "Where it goes"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "14px 20px", color: "var(--muted)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEE_ROWS.map((r, i) => (
                <tr key={r.action} style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <td style={{ padding: "14px 20px", color: "var(--text-2)" }}>{r.action}</td>
                  <td style={{ padding: "14px 20px", color: r.fee === "0%" || r.fee === "Gas only" ? "var(--up)" : "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.fee}</td>
                  <td style={{ padding: "14px 20px", color: "var(--faint)" }}>{r.to === "—" ? <Minus size={14} aria-label="Not applicable" /> : r.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <div style={{ maxWidth: 720, margin: "0 auto 64px" }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.5rem,2.8vw,2rem)", fontWeight: 500, margin: "0 0 24px", color: "var(--text)", textAlign: "center" }}>
            Questions, answered
          </h2>
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </Reveal>
    </div>
  );
}
