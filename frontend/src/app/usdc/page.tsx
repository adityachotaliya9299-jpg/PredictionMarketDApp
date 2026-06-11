"use client";
import { useUSDCMarkets } from "@/hooks/useUSDCMarket";
import { formatTimeLeft } from "@/lib/utils";
import { TrendingUp, Clock, Plus, ChevronRight, DollarSign } from "lucide-react";
import Link from "next/link";
import { formatUnits } from "viem";
import { CATEGORIES, CATEGORY_COLORS } from "@/types/market";
import { useState } from "react";

export default function USDCMarketsPage() {
  const { data: markets, isLoading } = useUSDCMarkets();
  const allMarkets = (markets as any[] | undefined) ?? [];
  const [search, setSearch] = useState("");

  const filtered = allMarkets.filter(m =>
    !search || m.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 16px", boxSizing:"border-box" as const }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap" as const, gap:16 }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:"#22c55e", fontSize:12, fontWeight:600, marginBottom:10 }}>
            <DollarSign size={11}/>USDC Markets
          </div>
          <h1 style={{ color:"white", fontSize:28, fontWeight:900, margin:"0 0 6px" }}>USDC Prediction Markets</h1>
          <p style={{ color:"#6b7280", fontSize:14, margin:0 }}>Trade with USDC stablecoin — no ETH price exposure</p>
        </div>
        <Link href="/usdc/create" style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:12, background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"white", textDecoration:"none", fontWeight:700, fontSize:14 }}>
          <Plus size={16}/>Create USDC Market
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:28 }}>
        {[
          { label:"Total Markets", value:String(allMarkets.length), color:"#22c55e" },
          { label:"Active", value:String(allMarkets.filter((m:any)=>!m.resolved).length), color:"#22d3ee" },
          { label:"Currency", value:"USDC", color:"#fbbf24" },
          { label:"Network", value:"Sepolia", color:"#a855f7" },
        ].map(s=>(
          <div key={s.label} style={{ padding:"12px 16px", borderRadius:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color:s.color, fontSize:18, fontWeight:800, fontFamily:"monospace" }}>{s.value}</div>
            <div style={{ color:"#6b7280", fontSize:11, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search USDC markets..."
        style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 16px", color:"white", fontSize:14, outline:"none", marginBottom:20, boxSizing:"border-box" as const }}/>

      {/* Markets */}
      {isLoading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {[1,2,3].map(i=><div key={i} style={{ height:180, borderRadius:16, background:"rgba(255,255,255,0.04)", animation:"pulse 2s infinite" }}/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:20 }}>
          <DollarSign size={48} color="#374151" style={{ margin:"0 auto 16px" }}/>
          <h2 style={{ color:"white", fontSize:20, fontWeight:700, marginBottom:8 }}>No USDC Markets Yet</h2>
          <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>Create the first stablecoin prediction market</p>
          <Link href="/usdc/create" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:12, color:"white", textDecoration:"none", fontSize:14, fontWeight:700 }}>
            <Plus size={15}/>Create First Market
          </Link>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {filtered.map((m:any, i:number) => {
            const expired = Math.floor(Date.now()/1000) >= Number(m.expirationTime);
            const status = m.resolved?"resolved":expired?"expired":"live";
            const statusColor = {live:"#22c55e",expired:"#fbbf24",resolved:"#3b82f6"}[status];
            const catColor = CATEGORY_COLORS[m.category] || "#6b7280";
            return (
              <Link key={i} href={`/usdc/${m.marketAddress}`} style={{ textDecoration:"none" }}>
                <div style={{ padding:20, borderRadius:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", transition:"all 0.2s", height:"100%", boxSizing:"border-box" as const }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(34,197,94,0.4)";(e.currentTarget as HTMLElement).style.background="rgba(34,197,94,0.05)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.07)";(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.04)";}}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:`${statusColor}18`, color:statusColor, border:`1px solid ${statusColor}30` }}>{status.toUpperCase()}</span>
                      <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:`${catColor}15`, color:catColor }}>{m.category}</span>
                    </div>
                    <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:"rgba(34,197,94,0.1)", color:"#22c55e", border:"1px solid rgba(34,197,94,0.2)" }}>USDC</span>
                  </div>
                  <h3 style={{ color:"white", fontSize:14, fontWeight:600, lineHeight:1.4, marginBottom:16, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" }}>{m.question}</h3>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6b7280" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}><TrendingUp size={12}/>USDC pool</div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={12}/>{formatTimeLeft(BigInt(m.expirationTime || 0))}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
