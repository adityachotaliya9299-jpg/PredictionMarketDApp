"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useFactoryOwner } from "@/hooks/useMarket";
import { useAccount } from "wagmi";
import { TrendingUp, Plus, LayoutDashboard, Shield, Menu, X, Sun, Moon, Trophy, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MARKETS_LINKS = [
  { href:"/", label:"YES/NO Markets", icon:"⚡", desc:"Binary prediction markets" },
  { href:"/multi", label:"Multi-Outcome", icon:"🎯", desc:"2-10 outcome markets" },
  { href:"/usdc", label:"USDC Markets", icon:"💵", desc:"Trade with stablecoin" },
  { href:"/scalar", label:"Scalar Markets", icon:"📊", desc:"Price range predictions" },
];

const EARN_LINKS = [
  { href:"/portfolio", label:"Portfolio", icon:"💼", desc:"Your markets & rewards" },
  { href:"/staking", label:"Staking", icon:"🔒", desc:"Stake PRED, earn ETH" },
  { href:"/governance", label:"Governance", icon:"🏛️", desc:"Vote on proposals" },
];

const EXPLORE_LINKS = [
  { href:"/leaderboard", label:"Leaderboard", icon:"🏆", desc:"Top market creators" },
  { href:"/analytics", label:"Analytics", icon:"📈", desc:"Protocol statistics" },
];

function Dropdown({ label, links, dark, pathname }: {
  label: string; links: any[]; dark: boolean; pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = links.some(l => l.href !== "/" ? pathname.startsWith(l.href) : pathname === "/");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const textColor = dark ? "#9ca3af" : "#475569";
  const activeColor = "#22d3ee";

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={()=>setOpen(!open)}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, transition:"all 0.15s",
          color: isActive ? activeColor : textColor,
          background: isActive ? "rgba(34,211,238,0.08)" : "transparent" }}>
        {label}
        <ChevronDown size={13} style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}/>
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", width:220, borderRadius:14,
          background: dark?"rgba(10,10,15,0.98)":"rgba(255,255,255,0.98)",
          border: `1px solid ${dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`,
          boxShadow:"0 20px 40px rgba(0,0,0,0.4)", zIndex:1000, overflow:"hidden",
          animation:"dropIn 0.15s ease" }}>
          {links.map(l => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", textDecoration:"none", transition:"background 0.15s",
                  background: active ? "rgba(34,211,238,0.08)" : "transparent" }}
                onMouseEnter={e=>(e.currentTarget.style.background = active?"rgba(34,211,238,0.1)":dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)")}
                onMouseLeave={e=>(e.currentTarget.style.background = active?"rgba(34,211,238,0.08)":"transparent")}>
                <span style={{ fontSize:18, flexShrink:0 }}>{l.icon}</span>
                <div>
                  <div style={{ color: active ? "#22d3ee" : dark?"white":"#0f172a", fontSize:13, fontWeight:600 }}>{l.label}</div>
                  <div style={{ color:"#6b7280", fontSize:11, marginTop:1 }}>{l.desc}</div>
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

  const isAdmin = isConnected && !ownerLoading && !!address && !!owner &&
    address.toLowerCase() === owner.toLowerCase();

  const bg = dark ? "rgba(5,5,8,0.95)" : "rgba(248,250,252,0.97)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const logoText = dark ? "white" : "#0f172a";
  const textColor = dark ? "#9ca3af" : "#475569";

  const btnStyle = {
    width:36, height:36, borderRadius:8,
    border:`1px solid ${dark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.15)"}`,
    background: dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.05)",
    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
  };

  // All links for mobile menu
  const allMobileLinks = [
    { href:"/", label:"YES/NO Markets", icon:"⚡" },
    { href:"/multi", label:"Multi-Outcome", icon:"🎯" },
    { href:"/usdc", label:"USDC Markets", icon:"💵" },
    { href:"/scalar", label:"Scalar Markets", icon:"📊" },
    { href:"/create", label:"Create Market", icon:"➕" },
    { href:"/portfolio", label:"Portfolio", icon:"💼" },
    { href:"/staking", label:"Staking", icon:"🔒" },
    { href:"/governance", label:"Governance", icon:"🏛️" },
    { href:"/leaderboard", label:"Leaderboard", icon:"🏆" },
    { href:"/analytics", label:"Analytics", icon:"📈" },
    ...(isAdmin ? [{ href:"/admin", label:"Admin", icon:"⚙️" }] : []),
  ];

  return (
    <>
      <style>{`
        @keyframes dropIn{from{opacity:0;transform:translateX(-50%) translateY(-6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:bg, borderBottom:`1px solid ${border}`, backdropFilter:"blur(16px)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>

          {/* Logo */}
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#22d3ee,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <TrendingUp size={18} color="black"/>
            </div>
            <span style={{ color:logoText, fontWeight:900, fontSize:17, letterSpacing:"-0.02em" }}>PredictX</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display:"flex", alignItems:"center", gap:2 }} className="desktop-nav">
            <Dropdown label="Markets" links={MARKETS_LINKS} dark={dark} pathname={pathname}/>
            <Dropdown label="Earn" links={EARN_LINKS} dark={dark} pathname={pathname}/>
            <Dropdown label="Explore" links={EXPLORE_LINKS} dark={dark} pathname={pathname}/>
            <Link href="/create"
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:700, transition:"all 0.15s",
                background:"linear-gradient(135deg,#22d3ee,#3b82f6)", color:"black" }}>
              <Plus size={14}/>Create
            </Link>
            {isAdmin && (
              <Link href="/admin" style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 10px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600,
                color:pathname==="/admin"?"#fbbf24":textColor, background:pathname==="/admin"?"rgba(251,191,36,0.1)":"transparent" }}>
                <Shield size={14}/>Admin
              </Link>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={toggle} style={btnStyle} title="Toggle theme">
              {dark ? <Sun size={15} color="#9ca3af"/> : <Moon size={15} color="#475569"/>}
            </button>
            <div className="desktop-connect"><ConnectButton/></div>
            <button onClick={()=>setMobileOpen(!mobileOpen)} style={{ ...btnStyle, display:"none" }} className="mobile-menu-btn">
              {mobileOpen ? <X size={18} color={dark?"#9ca3af":"#475569"}/> : <Menu size={18} color={dark?"#9ca3af":"#475569"}/>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ borderTop:`1px solid ${border}`, background:bg, padding:"12px 16px", animation:"slideDown 0.2s ease" }}>
            <div style={{ marginBottom:12 }}><ConnectButton/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {allMobileLinks.map(l => {
                const active = l.href==="/"?pathname==="/":pathname.startsWith(l.href);
                return (
                  <Link key={l.href} href={l.href} onClick={()=>setMobileOpen(false)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:10, textDecoration:"none",
                      background:active?"rgba(34,211,238,0.1)":"rgba(255,255,255,0.04)",
                      border:`1px solid ${active?"rgba(34,211,238,0.3)":"rgba(255,255,255,0.06)"}` }}>
                    <span style={{ fontSize:16 }}>{l.icon}</span>
                    <span style={{ color:active?"#22d3ee":dark?"white":"#0f172a", fontSize:13, fontWeight:600 }}>{l.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height:60 }}/>

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
