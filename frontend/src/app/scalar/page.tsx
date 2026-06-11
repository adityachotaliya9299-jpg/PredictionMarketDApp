"use client";
import { useScalarMarkets } from "@/hooks/useUSDCMarket";
import { formatTimeLeft } from "@/lib/utils";
import { TrendingUp, Clock, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

const COLORS = ["#22d3ee","#a855f7","#f97316","#10b981","#f59e0b","#ef4444"];
const ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const BTC_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";

export default function ScalarMarketsPage() {
  const { data: markets, isLoading } = useScalarMarkets();
  const allMarkets = (markets as any[] | undefined) ?? [];

  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 16px", boxSizing:"border-box" as const }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap" as const, gap:16 }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.25)", color:"#fbbf24", fontSize:12, fontWeight:600, marginBottom:10 }}>
            📊 Scalar Markets
          </div>
          <h1 style={{ color:"white", fontSize:28, fontWeight:900, margin:"0 0 6px" }}>Scalar Markets</h1>
          <p style={{ color:"#6b7280", fontSize:14, margin:0 }}>Predict price ranges using Chainlink live feeds</p>
        </div>
        <Link href="/scalar/create" style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:12, background:"linear-gradient(135deg,#fbbf24,#f97316)", color:"black", textDecoration:"none", fontWeight:700, fontSize:14 }}>
          <Plus size={16}/>Create Scalar Market
        </Link>
      </div>

      {/* Live prices info */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:28 }}>
        {[
          { label:"ETH/USD Feed", value:"Chainlink Sepolia", feed:ETH_FEED, color:"#627EEA", icon:"Ξ" },
          { label:"BTC/USD Feed", value:"Chainlink Sepolia", feed:BTC_FEED, color:"#F7931A", icon:"₿" },
          { label:"Total Markets", value:String(allMarkets.length), color:"#22d3ee", icon:"📊" },
        ].map(s=>(
          <div key={s.label} style={{ padding:"14px 16px", borderRadius:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:24, color:s.color }}>{s.icon}</span>
            <div>
              <div style={{ color:s.color, fontSize:15, fontWeight:700 }}>{s.value}</div>
              <div style={{ color:"#6b7280", fontSize:11 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {[1,2,3].map(i=><div key={i} style={{ height:200, borderRadius:16, background:"rgba(255,255,255,0.04)", animation:"pulse 2s infinite" }}/>)}
        </div>
      ) : allMarkets.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:20 }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📊</div>
          <h2 style={{ color:"white", fontSize:20, fontWeight:700, marginBottom:8 }}>No Scalar Markets Yet</h2>
          <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>Create the first price-range prediction market</p>
          <Link href="/scalar/create" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"linear-gradient(135deg,#fbbf24,#f97316)", borderRadius:12, color:"black", textDecoration:"none", fontSize:14, fontWeight:700 }}>
            <Plus size={15}/>Create First Scalar Market
          </Link>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {allMarkets.map((m:any, i:number) => {
            const expired = Math.floor(Date.now()/1000) >= Number(m.expirationTime);
            const status = m.resolved?"resolved":expired?"expired":"live";
            const statusColor = {live:"#10b981",expired:"#fbbf24",resolved:"#3b82f6"}[status];
            return (
              <Link key={i} href={`/multi/${m.marketAddress}`} style={{ textDecoration:"none" }}>
                <div style={{ padding:20, borderRadius:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(251,191,36,0.4)";(e.currentTarget as HTMLElement).style.background="rgba(251,191,36,0.05)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.07)";(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.04)";}}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                    <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:`${statusColor}18`, color:statusColor, border:`1px solid ${statusColor}30` }}>{status.toUpperCase()}</span>
                    <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:"rgba(251,191,36,0.1)", color:"#fbbf24" }}>📊 Scalar</span>
                  </div>
                  <h3 style={{ color:"white", fontSize:14, fontWeight:600, lineHeight:1.4, marginBottom:14, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" }}>{m.question}</h3>
                  <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6, marginBottom:12 }}>
                    {(m.ranges as string[]).map((r:string, ri:number) => (
                      <span key={ri} style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:`${COLORS[ri%COLORS.length]}18`, color:COLORS[ri%COLORS.length] }}>{r}</span>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6b7280" }}>
                    <span>📡 Chainlink</span>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={12}/>{formatTimeLeft(BigInt(m.expirationTime||0))}</div>
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
