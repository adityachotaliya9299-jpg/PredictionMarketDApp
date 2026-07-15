"use client";
import { useSubgraphMultiMarkets } from "@/hooks/useSubgraph";
import { formatETH, formatTimeLeft } from "@/lib/utils";
import { TrendingUp, Clock, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

const COLORS = ["var(--accent)","var(--accent-3)","#f97316","var(--up)","var(--warn)","var(--down)","var(--accent-2)","#ec4899"];

export default function MultiMarketsPage() {
  const { data: markets, isLoading } = useSubgraphMultiMarkets();
  const allMarkets = (markets as any[] | undefined) ?? [];

  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 16px", boxSizing:"border-box" as const }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap" as const, gap:16 }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:"rgba(var(--accent3-rgb),0.1)", border:"1px solid rgba(var(--accent3-rgb),0.25)", color:"var(--accent-3)", fontSize:12, fontWeight:600, marginBottom:10 }}>
            🎯 Multi-Outcome Markets
          </div>
          <h1 style={{ color:"var(--text)", fontSize:28, fontWeight:900, margin:"0 0 6px" }}>Multi-Outcome Markets</h1>
          <p style={{ color:"var(--faint)", fontSize:14, margin:0 }}>Predict which outcome wins from multiple choices</p>
        </div>
        <Link href="/multi/create" style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:12, background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", color:"var(--text)", textDecoration:"none", fontWeight:700, fontSize:14 }}>
          <Plus size={16}/>Create Multi-Outcome
        </Link>
      </div>

      {/* Markets grid */}
      {isLoading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
          {[1,2,3].map(i=><div key={i} style={{ height:220, borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", animation:"pulse 2s infinite" }}/>)}
        </div>
      ) : allMarkets.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px", border:"1px dashed rgba(var(--fg-rgb),0.08)", borderRadius:20 }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎯</div>
          <h2 style={{ color:"var(--text)", fontSize:20, fontWeight:700, marginBottom:8 }}>No Multi-Outcome Markets Yet</h2>
          <p style={{ color:"var(--faint)", fontSize:14, marginBottom:24 }}>Create the first market with multiple possible outcomes</p>
          <Link href="/multi/create" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", borderRadius:12, color:"var(--text)", textDecoration:"none", fontSize:14, fontWeight:700 }}>
            <Plus size={15}/>Create First Market
          </Link>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
          {allMarkets.map((m: any, idx: number) => {
            const expired = Math.floor(Date.now()/1000) >= Number(m.endTime || m.expirationTime || 0);
            const status = m.resolved ? "resolved" : expired ? "expired" : "live";
            const statusColor = { live:"var(--up)", expired:"var(--warn)", resolved:"var(--accent-2)" }[status];
            return (
              <Link key={idx} href={`/multi/${m.address}`} style={{ textDecoration:"none" }}>
                <div style={{ padding:20, borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.07)", cursor:"pointer", transition:"all 0.2s", height:"100%", boxSizing:"border-box" as const }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(var(--accent3-rgb),0.4)";(e.currentTarget as HTMLElement).style.background="rgba(var(--accent3-rgb),0.05)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(var(--fg-rgb),0.07)";(e.currentTarget as HTMLElement).style.background="rgba(var(--fg-rgb),0.04)";}}>

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:`${statusColor}18`, color:statusColor, border:`1px solid ${statusColor}30` }}>
                      {status.toUpperCase()}
                    </span>
                    <ChevronRight size={16} color="var(--faint-2)"/>
                  </div>

                  <h3 style={{ color:"var(--text)", fontSize:14, fontWeight:600, lineHeight:1.4, marginBottom:16, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" }}>
                    {m.question}
                  </h3>

                  {/* Outcomes pills */}
                  <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6, marginBottom:14 }}>
                    {(m.outcomes as string[]).slice(0,4).map((o: string, i: number) => (
                      <span key={i} style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:`${COLORS[i%COLORS.length]}18`, color:COLORS[i%COLORS.length], border:`1px solid ${COLORS[i%COLORS.length]}30` }}>
                        {o}
                      </span>
                    ))}
                    {m.outcomes.length > 4 && <span style={{ color:"var(--faint-2)", fontSize:11 }}>+{m.outcomes.length-4} more</span>}
                  </div>

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, color:"var(--faint)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <TrendingUp size={12}/>{m.outcomes.length} outcomes
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <Clock size={12}/>{formatTimeLeft(BigInt(m.endTime || m.expirationTime || 0))}
                    </div>
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
