"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useFactoryOwner } from "@/hooks/useMarket";
import { useAccount } from "wagmi";
import { TrendingUp, Plus, LayoutDashboard, Shield, Menu, X, Sun, Moon, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { data: owner, isLoading: ownerLoading } = useFactoryOwner();
  const [open, setOpen] = useState(false);
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

  const links = [
    { href: "/", label: "Markets", icon: TrendingUp },
    { href: "/create", label: "Create", icon: Plus },
    { href: "/portfolio", label: "Portfolio", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  // Theme-aware colors
  const bg = dark ? "rgba(5,5,8,0.93)" : "rgba(248,250,252,0.97)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const logoText = dark ? "white" : "#0f172a";
  const navColor = (active: boolean) => active
    ? { color: "#22d3ee", background: "rgba(34,211,238,0.1)" }
    : { color: dark ? "#9ca3af" : "#475569", background: "transparent" };
  const adminColor = (active: boolean) => active
    ? { color: "#fbbf24", background: "rgba(251,191,36,0.1)" }
    : { color: dark ? "#9ca3af" : "#475569", background: "transparent" };
  const btnStyle = {
    width:36, height:36, borderRadius:8,
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
    background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
    color: dark ? "#e5e7eb" : "#475569", flexShrink:0 as const
  };
  const mobileMenuBg = dark ? "#050508" : "#f1f5f9";
  const mobileBorder = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <>
      <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999, background:bg, backdropFilter:"blur(16px)", borderBottom:`1px solid ${border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", height:64, gap:12 }}>
          {/* Logo */}
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none", flexShrink:0 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#22d3ee,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <TrendingUp size={16} color="black" strokeWidth={2.5}/>
            </div>
            <span style={{ color:logoText, fontWeight:700, fontSize:18, fontFamily:"monospace" }}>
              Predict<span style={{ color:"#22d3ee" }}>X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="px-nav" style={{ display:"flex", alignItems:"center", gap:4, flex:1, justifyContent:"center" }}>
            {links.map(({href,label,icon:I})=>(
              <Link key={href} href={href} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, fontSize:14, fontWeight:500, textDecoration:"none", ...navColor(pathname===href) }}>
                <I size={15}/>{label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, fontSize:14, fontWeight:500, textDecoration:"none", ...adminColor(pathname==="/admin") }}>
                <Shield size={15}/>Admin
              </Link>
            )}
          </nav>

          {/* Right */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <button onClick={toggle} style={btnStyle} title="Toggle theme">
              {dark ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
            <ConnectButton chainStatus="icon" showBalance={{smallScreen:false, largeScreen:true}} accountStatus={{smallScreen:"avatar", largeScreen:"full"}}/>
            <button onClick={()=>setOpen(!open)} className="px-ham" style={{...btnStyle, display:"none"}}>
              {open ? <X size={17}/> : <Menu size={17}/>}
            </button>
          </div>
        </div>

        {open && (
          <div style={{ background:mobileMenuBg, borderTop:`1px solid ${mobileBorder}`, padding:"10px 16px 16px" }}>
            {links.map(({href,label,icon:I})=>(
              <Link key={href} href={href} onClick={()=>setOpen(false)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10, fontSize:14, fontWeight:500, textDecoration:"none", marginBottom:4, ...navColor(pathname===href) }}>
                <I size={15}/>{label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={()=>setOpen(false)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10, fontSize:14, fontWeight:500, textDecoration:"none", ...adminColor(pathname==="/admin") }}>
                <Shield size={15}/>Admin
              </Link>
            )}
          </div>
        )}
      </header>
      <style>{`
        @media(max-width:768px){
          .px-nav{display:none!important}
          .px-ham{display:flex!important}
        }
      `}</style>
    </>
  );
}
