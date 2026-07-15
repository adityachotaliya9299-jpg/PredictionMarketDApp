"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useSubgraphMarkets } from "@/hooks/useSubgraph";
import { useMarketCount } from "@/hooks/useMarket";
import { MarketCard } from "@/components/market/MarketCard";
import { TerrainBackground } from "@/components/shared/TerrainBackground";
import { Reveal } from "@/components/shared/Reveal";
import { CATEGORIES, type MarketMetadata } from "@/types/market";
import {
  Search, Globe, ChevronRight, ChevronDown, Plus, Scale, Landmark, Coins,
  GitBranch, Users, LineChart, Layers, DollarSign, Gauge, ArrowRight,
} from "lucide-react";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: "01",
    title: "Take a position",
    body: "Back YES or NO with ETH — or trade multi-outcome, scalar, and USDC markets. Your stake joins the outcome pool.",
  },
  {
    n: "02",
    title: "The crowd sets the price",
    body: "Probabilities are derived live from the ratio of capital in each pool. No market maker, no order book, no house.",
  },
  {
    n: "03",
    title: "Truth pays out",
    body: "When the oracle resolves, the entire pool is redistributed to the winning side — proportionally, automatically, on-chain.",
  },
];

const FEATURES = [
  { icon: Scale, title: "Parimutuel engine", body: "Winners share the whole pool pro-rata. Zero counterparty risk, deep effective liquidity from day one." },
  { icon: Gauge, title: "Oracle settlement", body: "Chainlink price feeds and on-chain resolution — outcomes are settled by data, not by discretion." },
  { icon: Coins, title: "PRED rewards", body: "Earn PRED for creating markets and trading. Activity is ownership." },
  { icon: Users, title: "Referral yield", body: "Refer a trader, earn 0.5% of their volume in ETH — paid by the protocol, forever." },
  { icon: Landmark, title: "Staking", body: "Stake PRED to earn a share of protocol fees in ETH. Skin in the game, rewarded." },
  { icon: GitBranch, title: "Governance", body: "PRED holders vote on fees, categories, and treasury. The protocol belongs to its users." },
];

const MARKET_TYPES = [
  { href: "/", icon: LineChart, title: "YES / NO", body: "Binary markets on any question with a verifiable answer." },
  { href: "/multi", icon: Layers, title: "Multi-outcome", body: "Two to ten outcomes — elections, awards, tournaments." },
  { href: "/usdc", icon: DollarSign, title: "USDC markets", body: "Stablecoin-denominated positions without ETH exposure." },
  { href: "/scalar", icon: Gauge, title: "Scalar", body: "Trade a range, not a coin flip — where will the number land?" },
];

export default function HomePage() {
  const { data: markets, isLoading } = useSubgraphMarkets();
  const { data: totalCount } = useMarketCount();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const reduced = useReducedMotion();

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, reduced ? 0 : 140]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, reduced ? 1 : 0.25]);

  useEffect(() => {
    const t = setTimeout(() => { if (isLoading) setTimedOut(true); }, 15000);
    return () => clearTimeout(t);
  }, [isLoading]);

  const filtered = useMemo(() => {
    if (!markets) return [];
    return (markets as MarketMetadata[]).filter(m => {
      const ms = !search || m.question.toLowerCase().includes(search.toLowerCase());
      const mc = !category || m.category === category;
      return ms && mc;
    });
  }, [markets, search, category]);

  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 36 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      {/* ============================== HERO ============================== */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", borderBottom: "1px solid rgba(var(--fg-rgb),0.06)" }}>
        <TerrainBackground />
        {/* Halo behind the headline */}
        <div aria-hidden style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)", width: 720, height: 420, background: "radial-gradient(ellipse, rgba(var(--accent-rgb),0.10) 0%, transparent 65%)", filter: "blur(20px)", pointerEvents: "none" }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity, position: "relative", maxWidth: 1280, margin: "0 auto", padding: "96px 24px 64px", textAlign: "center", width: "100%" }}>
          <motion.div {...enter(0)}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 999, border: "1px solid rgba(var(--accent-rgb),0.25)", background: "rgba(var(--accent-rgb),0.06)", color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--up)", display: "inline-block", animation: "pulse 2s infinite" }} aria-hidden />
              LIVE ON SEPOLIA · FORMERLY PREDICTX
            </div>
          </motion.div>

          <motion.h1
            {...enter(0.15)}
            className="font-display"
            style={{ fontSize: "clamp(2.6rem,6.5vw,4.8rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 24px", color: "var(--text)" }}
          >
            Trade the outcome,
            <br />
            <em className="gradient-text" style={{ fontStyle: "italic", fontWeight: 600 }}>not the opinion.</em>
          </motion.h1>

          <motion.p {...enter(0.3)} style={{ color: "var(--muted)", fontSize: 17, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Verity is a decentralized prediction market. Every probability is set by the crowd,
            every settlement executed by code — parimutuel pools, on-chain oracles, no middlemen.
          </motion.p>

          <motion.div {...enter(0.45)} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 64 }}>
            <a href="#markets" style={{ padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg,var(--accent),var(--accent-2))", color: "var(--on-accent)", fontWeight: 700, fontSize: 15, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(var(--accent-rgb),0.25)" }}>
              Explore markets <ChevronRight size={16} aria-hidden />
            </a>
            <Link href="/create" style={{ padding: "14px 28px", borderRadius: 12, border: "1px solid rgba(var(--fg-rgb),0.15)", color: "var(--text-2)", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(var(--fg-rgb),0.03)" }}>
              Create a market
            </Link>
          </motion.div>

          <motion.div {...enter(0.6)} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "clamp(24px,5vw,56px)" }}>
            {[
              { v: String(totalCount ?? "—"), l: "Live markets" },
              { v: "2%", l: "Protocol fee" },
              { v: "100%", l: "On-chain settlement" },
              { v: "0", l: "Custodians" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div className="font-display" style={{ fontSize: 32, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{s.v}</div>
                <div style={{ color: "var(--faint)", fontSize: 12, marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        {!reduced && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", color: "var(--faint)" }}
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown size={20} />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* ====================== TRUST STRIP ====================== */}
      <div style={{ borderBottom: "1px solid rgba(var(--fg-rgb),0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "clamp(20px,4vw,48px)", color: "var(--faint)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <span>Built on</span>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>Ethereum</span>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>Chainlink</span>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>The Graph</span>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>OpenZeppelin</span>
        </div>
      </div>

      {/* ====================== HOW IT WORKS ====================== */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "112px 24px 96px" }}>
        <Reveal>
          <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>How it works</p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)", fontWeight: 500, textAlign: "center", margin: "0 0 64px", color: "var(--text)" }}>
            Three moves. No trust required.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.18}>
              <div style={{ position: "relative", borderRadius: 20, border: "1px solid rgba(var(--fg-rgb),0.08)", background: "rgba(var(--fg-rgb),0.03)", padding: "36px 28px", height: "100%" }}>
                <div className="font-display" style={{ fontSize: 44, fontWeight: 600, color: "transparent", WebkitTextStroke: "1px rgba(var(--accent-rgb),0.55)", marginBottom: 20 }}>{s.n}</div>
                <h3 style={{ color: "var(--text)", fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ====================== FEATURES ====================== */}
      <section style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.06)", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 24px" }}>
          <Reveal>
            <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>The protocol</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)", fontWeight: 500, margin: "0 0 16px", color: "var(--text)", maxWidth: 560 }}>
              Everything a market needs. Nothing a middleman adds.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 520, lineHeight: 1.7, marginBottom: 56 }}>
              Six primitives, one protocol — every one of them settled by smart contract on Ethereum.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.12}>
                <div style={{ borderRadius: 18, border: "1px solid rgba(var(--fg-rgb),0.07)", background: "var(--bg)", padding: 28, height: "100%", transition: "border-color 0.3s" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(var(--accent-rgb),0.08)", border: "1px solid rgba(var(--accent-rgb),0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <f.icon size={20} color="var(--accent)" aria-hidden />
                  </div>
                  <h3 style={{ color: "var(--text)", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{f.title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== MARKET TYPES ====================== */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 24px" }}>
        <Reveal>
          <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Four ways to trade</p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)", fontWeight: 500, textAlign: "center", margin: "0 0 56px", color: "var(--text)" }}>
            Every question has a market.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {MARKET_TYPES.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.12}>
              <Link href={m.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div
                  style={{ borderRadius: 18, border: "1px solid rgba(var(--fg-rgb),0.08)", background: "rgba(var(--fg-rgb),0.03)", padding: 28, height: "100%", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),0.4)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(var(--fg-rgb),0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <m.icon size={22} color="var(--accent)" style={{ marginBottom: 16 }} aria-hidden />
                  <h3 style={{ color: "var(--text)", fontSize: 17, fontWeight: 700, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                    {m.title} <ArrowRight size={14} color="var(--faint)" aria-hidden />
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{m.body}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ====================== PRICING TEASER ====================== */}
      <section style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <Reveal>
            <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Pricing</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)", fontWeight: 500, margin: "0 0 16px", color: "var(--text)" }}>
              One fee. No subscriptions to trade.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}>
              Trading costs a flat 2% protocol fee — that&apos;s it. Pro and Institutional plans add
              analytics, API access, and white-label markets for teams that need more.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 40 }}>
              {[
                { name: "Trader", price: "Free", note: "2% fee per trade" },
                { name: "Pro", price: "$29/mo", note: "Analytics + API + fee rebates" },
                { name: "Institutional", price: "Custom", note: "White-label + dedicated oracle" },
              ].map(t => (
                <div key={t.name} style={{ borderRadius: 16, border: `1px solid ${t.name === "Pro" ? "rgba(var(--accent-rgb),0.4)" : "rgba(var(--fg-rgb),0.08)"}`, background: t.name === "Pro" ? "rgba(var(--accent-rgb),0.05)" : "rgba(var(--fg-rgb),0.03)", padding: "24px 32px", minWidth: 200 }}>
                  <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{t.name}</div>
                  <div className="font-display" style={{ color: "var(--text)", fontSize: 26, fontWeight: 600 }}>{t.price}</div>
                  <div style={{ color: "var(--faint)", fontSize: 12.5, marginTop: 6 }}>{t.note}</div>
                </div>
              ))}
            </div>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--accent)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Compare plans <ArrowRight size={16} aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ====================== LIVE MARKETS ====================== */}
      <section id="markets" style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.06)", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px 64px", width: "100%" }}>
          <Reveal>
            <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 500, margin: "0 0 32px", color: "var(--text)" }}>
              Live markets
            </h2>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} aria-hidden />
              <label htmlFor="market-search" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Search markets</label>
              <input
                id="market-search"
                type="search"
                style={{ width: "100%", background: "rgba(var(--fg-rgb),0.04)", border: "1px solid rgba(var(--fg-rgb),0.1)", borderRadius: 12, padding: "12px 16px 12px 40px", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }}
                placeholder="Search markets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                style={{ padding: "10px 16px", borderRadius: 10, border: !category ? "1px solid rgba(var(--accent-rgb),0.4)" : "1px solid rgba(var(--fg-rgb),0.08)", background: !category ? "rgba(var(--accent-rgb),0.1)" : "transparent", color: !category ? "var(--accent)" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                onClick={() => setCategory(null)}
              >
                All
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  style={{ padding: "10px 16px", borderRadius: 10, border: category === c ? "1px solid rgba(var(--accent-rgb),0.4)" : "1px solid rgba(var(--fg-rgb),0.08)", background: category === c ? "rgba(var(--accent-rgb),0.1)" : "transparent", color: category === c ? "var(--accent)" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  onClick={() => setCategory(category === c ? null : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {isLoading && !timedOut ? (
            <>
              <p style={{ color: "var(--faint)", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 1.5s infinite" }} aria-hidden />
                Loading markets from The Graph...
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{ borderRadius: 16, border: "1px solid rgba(var(--fg-rgb),0.06)", background: "rgba(var(--fg-rgb),0.03)", padding: 20, animation: "pulse 2s infinite", animationDelay: `${i * 0.1}s` }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      <div style={{ height: 20, width: 60, borderRadius: 99, background: "rgba(var(--fg-rgb),0.06)" }} />
                      <div style={{ height: 20, width: 40, borderRadius: 99, background: "rgba(var(--fg-rgb),0.06)" }} />
                    </div>
                    <div style={{ height: 14, width: "90%", borderRadius: 6, background: "rgba(var(--fg-rgb),0.06)", marginBottom: 8 }} />
                    <div style={{ height: 14, width: "70%", borderRadius: 6, background: "rgba(var(--fg-rgb),0.06)", marginBottom: 20 }} />
                    <div style={{ height: 8, borderRadius: 99, background: "rgba(var(--fg-rgb),0.06)", marginBottom: 6 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                      <div style={{ height: 12, width: 60, borderRadius: 6, background: "rgba(var(--fg-rgb),0.06)" }} />
                      <div style={{ height: 12, width: 60, borderRadius: 6, background: "rgba(var(--fg-rgb),0.06)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <Globe size={40} color="var(--faint-2)" style={{ margin: "0 auto 16px" }} aria-hidden />
              <p style={{ color: "var(--faint)", fontSize: 16, marginBottom: 16 }}>
                {search || category ? "No markets match your filters" : "No markets yet"}
              </p>
              <Link href="/create" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "rgba(var(--accent-rgb),0.08)", border: "1px solid rgba(var(--accent-rgb),0.25)", borderRadius: 10, color: "var(--accent)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                <Plus size={16} aria-hidden />Create the first market
              </Link>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--faint)", fontSize: 14, marginBottom: 16 }}>
                {filtered.length} market{filtered.length !== 1 ? "s" : ""} found
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                {filtered.map(m => <MarketCard key={m.marketId} market={m as MarketMetadata} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ====================== FINAL CTA ====================== */}
      <section style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.06)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", bottom: "-40%", left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(var(--accent-rgb),0.09) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 24px", textAlign: "center", position: "relative" }}>
          <Reveal>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,4.5vw,3.4rem)", fontWeight: 500, margin: "0 0 20px", color: "var(--text)" }}>
              The future has a price.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, margin: "0 auto 40px", maxWidth: 440, lineHeight: 1.7 }}>
              Open a market on anything with a verifiable answer — and let the crowd find the truth.
            </p>
            <Link href="/create" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 12, background: "linear-gradient(135deg,var(--accent),var(--accent-2))", color: "var(--on-accent)", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 32px rgba(var(--accent-rgb),0.25)" }}>
              Create a market <ChevronRight size={18} aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
