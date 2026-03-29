"use client";
import Link from "next/link";
import { Clock, TrendingUp, ChevronRight, Lock } from "lucide-react";
import { formatETH, formatTimeLeft, formatProbabilityNumber } from "@/lib/utils";
import { getMarketStatus, CATEGORY_COLORS, type MarketMetadata } from "@/types/market";
import { useMarketInfo, useMarketProbability } from "@/hooks/useMarket";

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  open:     { color:"#10b981", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.2)",  label:"LIVE" },
  expired:  { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.2)",  label:"EXPIRED" },
  resolved: { color:"#3b82f6", bg:"rgba(59,130,246,0.1)",  border:"rgba(59,130,246,0.2)",  label:"RESOLVED" },
  paused:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.2)",   label:"PAUSED" },
  invalid:  { color:"#6b7280", bg:"rgba(107,114,128,0.1)", border:"rgba(107,114,128,0.2)", label:"INVALID" },
};

export function MarketCard({ market }: { market: MarketMetadata }) {
  const { data: info } = useMarketInfo(market.marketAddress);
  const { data: probability } = useMarketProbability(market.marketAddress);

  const status = info ? getMarketStatus(info) : "open";
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.open;
  const yesPct = probability ? formatProbabilityNumber(probability[0]) : 50;
  const noPct = 100 - yesPct;
  const catColor = CATEGORY_COLORS[market.category] || "#6b7280";
  const poolEth = info ? formatETH(info.totalPool) : "0 ETH";
  const timeLeft = formatTimeLeft(market.expirationTime);

  return (
    <Link href={`/markets/${market.marketAddress}`} style={{ textDecoration:"none", display:"block", height:"100%" }}>
      <div style={{
        position:"relative", height:"100%", borderRadius:16,
        border:"1px solid rgba(255,255,255,0.07)",
        background:"linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
        padding:20, transition:"all 0.2s", cursor:"pointer",
        opacity: status==="paused" ? 0.6 : 1,
        boxSizing:"border-box",
      }}
        onMouseEnter={e=>{
          (e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.15)";
          (e.currentTarget as HTMLDivElement).style.background="linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 100%)";
          (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 32px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={e=>{
          (e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.07)";
          (e.currentTarget as HTMLDivElement).style.background="linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%)";
          (e.currentTarget as HTMLDivElement).style.transform="translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow="none";
        }}
      >
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" as const }}>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, color:catColor, background:`${catColor}18`, border:`1px solid ${catColor}30` }}>
              {market.category}
            </span>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, color:st.color, background:st.bg, border:`1px solid ${st.border}` }}>
              {st.label}
            </span>
          </div>
          <ChevronRight size={16} color="#4b5563" style={{ flexShrink:0, marginTop:2 }}/>
        </div>

        {/* Question */}
        <h3 style={{ color:"white", fontWeight:600, fontSize:14, lineHeight:1.5, marginBottom:20, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" }}>
          {market.question}
        </h3>

        {/* Probability Bar */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:"monospace", marginBottom:6 }}>
            <span style={{ color:"#10b981", fontWeight:700 }}>YES {yesPct.toFixed(1)}%</span>
            <span style={{ color:"#ef4444", fontWeight:700 }}>NO {noPct.toFixed(1)}%</span>
          </div>
          <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${yesPct}%`, background:"linear-gradient(90deg,#10b981,#22d3ee)", borderRadius:99, transition:"width 0.5s ease" }}/>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, color:"#6b7280" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <TrendingUp size={13}/><span>{poolEth}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Clock size={13}/><span>{timeLeft}</span>
          </div>
        </div>

        {/* Paused overlay */}
        {status==="paused" && (
          <div style={{ position:"absolute", inset:0, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, color:"#ef4444", fontWeight:700, fontSize:14 }}>
              <Lock size={16}/>Market Paused
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
