"use client";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

const PLATFORM_LINKS = [
  { href: "/", label: "Browse Markets" },
  { href: "/create", label: "Create Market" },
  { href: "/portfolio", label: "My Portfolio" },
  { href: "/pricing", label: "Pricing" },
];

const PROTOCOL_LINKS = [
  { href: "/staking", label: "Staking" },
  { href: "/governance", label: "Governance" },
  { href: "/analytics", label: "Analytics" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.07)", background: "var(--bg-2)", marginTop: 64 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Image src="/logo-mark.svg" alt="" width={26} height={26} />
              <span className="font-display" style={{ fontWeight: 600, fontSize: 17, letterSpacing: "0.14em", color: "var(--text)" }}>
                VERITY
              </span>
            </div>
            <p style={{ color: "var(--faint)", fontSize: 13, lineHeight: 1.7, maxWidth: 230 }}>
              Markets in truth. Decentralized prediction markets with parimutuel pools, on-chain oracles, and automated payouts.
            </p>
          </div>

          <div>
            <p style={{ color: "var(--muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Platform</p>
            {PLATFORM_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: "block", color: "var(--faint)", fontSize: 14, textDecoration: "none", marginBottom: 10 }}>
                {label}
              </Link>
            ))}
          </div>

          <div>
            <p style={{ color: "var(--muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Protocol</p>
            {PROTOCOL_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: "block", color: "var(--faint)", fontSize: 14, textDecoration: "none", marginBottom: 10 }}>
                {label}
              </Link>
            ))}
          </div>

          <div>
            <p style={{ color: "var(--muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Contracts (Sepolia)</p>
            {[
              { label: "MarketFactory", href: `https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_FACTORY_ADDRESS}` },
              { label: "MockOracle", href: `https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_ORACLE_ADDRESS}` },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--faint)", fontSize: 14, textDecoration: "none", marginBottom: 10 }}>
                <ExternalLink size={12} aria-hidden />{label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.07)", marginTop: 36, paddingTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ color: "var(--faint-2)", fontSize: 12 }}>
            © {new Date().getFullYear()} Verity Protocol. Testnet software — no warranties. Formerly PredictX.
          </p>
          <a
            href="https://portfolio-one-bice-xqt0376aiu.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", fontSize: 13, fontFamily: "var(--font-mono)" }}
          >
            <span style={{ color: "var(--faint)" }}>Built by</span>
            <span style={{ fontWeight: 700, letterSpacing: "0.08em", color: "var(--accent)" }}>ADITYA CHOTALIYA</span>
            <ExternalLink size={12} color="var(--faint)" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
