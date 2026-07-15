"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useFactoryOwner } from "@/hooks/useMarket";
import { useAccount } from "wagmi";
import { Plus, Shield, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; icon: string; desc: string };

const MARKETS_LINKS: NavLink[] = [
  { href: "/", label: "YES/NO Markets", icon: "⚡", desc: "Binary prediction markets" },
  { href: "/multi", label: "Multi-Outcome", icon: "🎯", desc: "2-10 outcome markets" },
  { href: "/usdc", label: "USDC Markets", icon: "💵", desc: "Trade with stablecoin" },
  { href: "/scalar", label: "Scalar Markets", icon: "📊", desc: "Price range predictions" },
];

const EARN_LINKS: NavLink[] = [
  { href: "/portfolio", label: "Portfolio", icon: "💼", desc: "Your markets & rewards" },
  { href: "/staking", label: "Staking", icon: "🔒", desc: "Stake PRED, earn ETH" },
  { href: "/governance", label: "Governance", icon: "🏛️", desc: "Vote on proposals" },
];

const EXPLORE_LINKS: NavLink[] = [
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆", desc: "Top market creators" },
  { href: "/analytics", label: "Analytics", icon: "📈", desc: "Protocol statistics" },
  { href: "/pricing", label: "Pricing", icon: "🏷️", desc: "Fees & plans" },
];

function Dropdown({ label, links, pathname }: { label: string; links: NavLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = links.some(l => (l.href !== "/" ? pathname.startsWith(l.href) : pathname === "/"));

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          display: "flex", alignItems: "center", gap: 5, padding: "9px 12px", borderRadius: 8,
          border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.15s",
          fontFamily: "inherit",
          color: isActive ? "var(--accent)" : "var(--muted)",
          background: isActive ? "rgba(var(--accent-rgb),0.08)" : "transparent",
        }}
      >
        {label}
        <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
            width: 230, borderRadius: 14, background: "var(--bg-2)",
            border: "1px solid rgba(var(--fg-rgb),0.1)", boxShadow: "var(--shadow-card)",
            zIndex: 1000, overflow: "hidden", animation: "dropIn 0.15s ease",
          }}
        >
          {links.map(l => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
                  textDecoration: "none", transition: "background 0.15s",
                  background: active ? "rgba(var(--accent-rgb),0.08)" : "transparent",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(var(--fg-rgb),0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = active ? "rgba(var(--accent-rgb),0.08)" : "transparent")}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }} aria-hidden>{l.icon}</span>
                <div>
                  <div style={{ color: active ? "var(--accent)" : "var(--text)", fontSize: 13, fontWeight: 600 }}>{l.label}</div>
                  <div style={{ color: "var(--faint)", fontSize: 11, marginTop: 1 }}>{l.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { data: owner, isLoading: ownerLoading } = useFactoryOwner();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("light", !next);
  };

  const isAdmin =
    isConnected && !ownerLoading && !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  const iconBtn: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 10,
    border: "1px solid rgba(var(--fg-rgb),0.12)",
    background: "rgba(var(--fg-rgb),0.05)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  };

  const allMobileLinks = [
    ...MARKETS_LINKS,
    { href: "/create", label: "Create Market", icon: "➕", desc: "" },
    ...EARN_LINKS,
    ...EXPLORE_LINKS,
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: "⚙️", desc: "" }] : []),
  ];

  return (
    <>
      <style>{`
        @keyframes dropIn{from{opacity:0;transform:translateX(-50%) translateY(-6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <nav
        aria-label="Main"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          borderBottom: "1px solid rgba(var(--fg-rgb),0.08)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} aria-label="Verity home">
            <Image src="/logo-mark.svg" alt="" width={30} height={30} priority />
            <span className="font-display" style={{ color: "var(--text)", fontWeight: 600, fontSize: 19, letterSpacing: "0.14em" }}>
              VERITY
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="desktop-nav">
            <Dropdown label="Markets" links={MARKETS_LINKS} pathname={pathname} />
            <Dropdown label="Earn" links={EARN_LINKS} pathname={pathname} />
            <Dropdown label="Explore" links={EXPLORE_LINKS} pathname={pathname} />
            <Link
              href="/create"
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", marginLeft: 6,
                borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 700,
                background: "linear-gradient(135deg,var(--accent),var(--accent-2))",
                color: "var(--on-accent)", transition: "opacity 0.15s",
              }}
            >
              <Plus size={14} />Create
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "9px 10px", borderRadius: 8,
                  textDecoration: "none", fontSize: 14, fontWeight: 600,
                  color: pathname === "/admin" ? "var(--warn)" : "var(--muted)",
                  background: pathname === "/admin" ? "rgba(var(--warn-rgb),0.1)" : "transparent",
                }}
              >
                <Shield size={14} />Admin
              </Link>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggle} style={iconBtn} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
              {dark ? <Sun size={15} color="var(--muted)" /> : <Moon size={15} color="var(--muted)" />}
            </button>
            <div className="desktop-connect"><ConnectButton /></div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ ...iconBtn, display: "none" }}
              className="mobile-menu-btn"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} color="var(--muted)" /> : <Menu size={18} color="var(--muted)" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.08)", background: "var(--bg-2)", padding: "12px 16px", animation: "slideDown 0.2s ease" }}>
            <div style={{ marginBottom: 12 }}><ConnectButton /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {allMobileLinks.map(l => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", borderRadius: 10,
                      textDecoration: "none",
                      background: active ? "rgba(var(--accent-rgb),0.1)" : "rgba(var(--fg-rgb),0.04)",
                      border: `1px solid ${active ? "rgba(var(--accent-rgb),0.3)" : "rgba(var(--fg-rgb),0.06)"}`,
                    }}
                  >
                    <span style={{ fontSize: 16 }} aria-hidden>{l.icon}</span>
                    <span style={{ color: active ? "var(--accent)" : "var(--text)", fontSize: 13, fontWeight: 600 }}>{l.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ height: 64 }} />

      <style>{`
        @media(max-width:900px){
          .desktop-nav{display:none!important}
          .desktop-connect{display:none!important}
          .mobile-menu-btn{display:flex!important}
        }
      `}</style>
    </>
  );
}
