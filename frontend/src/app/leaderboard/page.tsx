"use client";
import { useSubgraphMarkets } from "@/hooks/useSubgraph";
import { type MarketMetadata } from "@/types/market";
import { shortenAddress } from "@/lib/utils";
import { Trophy, TrendingUp, Globe, Zap, Users, BarChart2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function LeaderboardPage() {
  const { data: markets, isLoading } = useSubgraphMarkets();
  const [tab, setTab] = useState<"creators"|"markets">("creators");
  const allMarkets = markets ?? [];

  const creatorStats = useMemo(() => {
    const stats: Record<string,{address:string;markets:number;active:number}> = {};
    allMarkets.forEach(m => {
      const addr = m.creator.toLowerCase();
      if (!stats[addr]) stats[addr] = { address:m.creator, markets:0, active:0 };
      stats[addr].markets++;
      if (m.active) stats[addr].active++;
    });
    return Object.values(stats).sort((a,b) => b.markets-a.markets);
  }, [allMarkets]);

  const skeletons = [1,2,3].map(i=><div key={i} style={{ height:56, borderRadius:12, background:"rgba(255,255,255,0.04)", marginBottom:8, animation:"pulse 2s infinite" }}/>);
  const rColors = ["#fbbf24","#9ca3af","#cd7c3f"];
  const rBg = ["rgba(251,191,36,0.12)","rgba(156,163,175,0.1)","rgba(205,124,63,0.1)"];

  return (
    <div style={{ minHeight:"100vh", background:"#050508" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      <div style={{ background:"linear-gradient(135deg,rgba(34,211,238,0.08),rgba(168,85,247,0.08))", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"48px 24px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#fbbf24,#f97316)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Trophy size={24} color="black"/>
            </div>
            <div>
              <h1 style={{ color:"white", fontSize:30, fontWeight:900, margin:0 }}>Leaderboard</h1>
              <p style={{ color:"#6b7280", fontSize:14, margin:0 }}>PredictX — Sepolia Testnet</p>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
            {[
              { label:"Total Markets", value:String(allMarkets.length), icon:<Globe size={18}/>, color:"#22d3ee" },
              { label:"Active Now", value:String(allMarkets.filter(m=>m.active).length), icon:<Zap size={18}/>, color:"#10b981" },
              { label:"Creators", value:String(creatorStats.length), icon:<Users size={18}/>, color:"#a855f7" },
              { label:"Categories", value:"8", icon:<BarChart2 size={18}/>, color:"#fbbf24" },
            ].map(s=>(
              <div key={s.label} style={{ padding:"14px 16px", borderRadius:14, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ color:"white", fontSize:20, fontWeight:800, fontFamily:"monospace", lineHeight:1.1 }}>{isLoading?"—":s.value}</div>
                  <div style={{ color:"#6b7280", fontSize:11, marginTop:2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ display:"flex", gap:4, marginBottom:24, background:"rgba(255,255,255,0.04)", borderRadius:12, padding:4, width:"fit-content" }}>
          {(["creators","markets"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 20px", borderRadius:9, fontWeight:600, fontSize:14, cursor:"pointer", border:"none", transition:"all 0.2s", background:tab===t?"rgba(34,211,238,0.15)":"transparent", color:tab===t?"#22d3ee":"#6b7280", boxShadow:tab===t?"inset 0 0 0 1px rgba(34,211,238,0.3)":"none" }}>
              {t==="creators"?"🏆 Top Creators":"📊 All Markets"}
            </button>
          ))}
        </div>

        {tab==="creators"&&(
          <div>
            {!isLoading && creatorStats.length >= 1 && (
              <div style={{ display:"grid", gridTemplateColumns:creatorStats.length>=3?"1fr 1fr 1fr":"1fr", gap:12, marginBottom:24 }}>
                {(creatorStats.length>=3?[creatorStats[1],creatorStats[0],creatorStats[2]]:[creatorStats[0]]).map((s,i)=>{
                  const rank = creatorStats.length>=3?(i===1?1:i===0?2:3):1;
                  return (
                    <div key={s.address} style={{ padding:"24px 16px", borderRadius:16, background:rBg[rank-1], border:`1px solid ${rColors[rank-1]}30`, textAlign:"center", transform:rank===1?"scale(1.04)":"none" }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>{["🥇","🥈","🥉"][rank-1]}</div>
                      <div style={{ color:rColors[rank-1], fontFamily:"monospace", fontSize:13, marginBottom:6 }}>{shortenAddress(s.address)}</div>
                      <div style={{ color:"white", fontSize:22, fontWeight:900, fontFamily:"monospace" }}>{s.markets}</div>
                      <div style={{ color:"#6b7280", fontSize:12 }}>market{s.markets!==1?"s":""} created</div>
                      {s.active>0&&<div style={{ marginTop:8, display:"inline-block", padding:"3px 10px", borderRadius:99, background:"rgba(16,185,129,0.15)", color:"#10b981", fontSize:11, fontWeight:600 }}>{s.active} active</div>}
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden" }}>
              <div style={{ padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"grid", gridTemplateColumns:"48px 1fr auto auto", gap:12 }}>
                {["Rank","Address","Markets","Active"].map(h=><span key={h} style={{ color:"#4b5563", fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.06em" }}>{h}</span>)}
              </div>
              {isLoading?skeletons:creatorStats.length===0?(
                <div style={{ padding:40, textAlign:"center" }}><p style={{ color:"#4b5563", fontSize:15 }}>No markets yet</p><Link href="/create" style={{ color:"#22d3ee", fontSize:14, textDecoration:"none" }}>Create the first →</Link></div>
              ):creatorStats.map((s,i)=>(
                <div key={s.address} style={{ padding:"14px 20px", borderBottom:i<creatorStats.length-1?"1px solid rgba(255,255,255,0.04)":"none", display:"grid", gridTemplateColumns:"48px 1fr auto auto", gap:12, alignItems:"center" }}>
                  <span style={{ color:i<3?rColors[i]:"#4b5563", fontWeight:700, fontSize:15 }}>{i<3?["🥇","🥈","🥉"][i]:`#${i+1}`}</span>
                  <a href={`https://sepolia.etherscan.io/address/${s.address}`} target="_blank" rel="noopener noreferrer" style={{ color:"#22d3ee", fontFamily:"monospace", fontSize:14, textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
                    {shortenAddress(s.address)}<ExternalLink size={12} color="#4b5563"/>
                  </a>
                  <span style={{ color:"white", fontWeight:700, fontFamily:"monospace", textAlign:"right" as const }}>{s.markets}</span>
                  <span style={{ color:s.active>0?"#10b981":"#4b5563", fontFamily:"monospace", textAlign:"right" as const }}>{s.active}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="markets"&&(
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"grid", gridTemplateColumns:"1fr 100px 140px 80px", gap:12 }}>
              {["Question","Category","Creator","Status"].map(h=><span key={h} style={{ color:"#4b5563", fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.06em" }}>{h}</span>)}
            </div>
            {isLoading?skeletons:allMarkets.length===0?(
              <div style={{ padding:40, textAlign:"center" }}><p style={{ color:"#4b5563" }}>No markets yet</p><Link href="/create" style={{ color:"#22d3ee", fontSize:14, textDecoration:"none" }}>Create first market →</Link></div>
            ):allMarkets.map((m,i)=>(
              <div key={m.marketId} style={{ padding:"14px 20px", borderBottom:i<allMarkets.length-1?"1px solid rgba(255,255,255,0.04)":"none", display:"grid", gridTemplateColumns:"1fr 100px 140px 80px", gap:12, alignItems:"center" }}>
                <Link href={`/markets/${m.marketAddress}`} style={{ color:"white", textDecoration:"none", fontWeight:500, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const, display:"block" }}>{m.question}</Link>
                <span style={{ padding:"3px 10px", borderRadius:99, background:"rgba(34,211,238,0.1)", color:"#22d3ee", fontSize:11, fontWeight:600, display:"inline-block" }}>{m.category}</span>
                <a href={`https://sepolia.etherscan.io/address/${m.creator}`} target="_blank" rel="noopener noreferrer" style={{ color:"#6b7280", fontFamily:"monospace", fontSize:12, textDecoration:"none" }}>{shortenAddress(m.creator)}</a>
                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, display:"inline-block", background:m.active?"rgba(16,185,129,0.1)":"rgba(107,114,128,0.1)", color:m.active?"#10b981":"#6b7280" }}>{m.active?"Active":"Inactive"}</span>
              </div>
            ))}
          </div>
        )}

        {!isLoading&&(
          <div style={{ marginTop:24, padding:"20px 24px", borderRadius:16, background:"linear-gradient(135deg,rgba(34,211,238,0.08),rgba(168,85,247,0.08))", border:"1px solid rgba(34,211,238,0.15)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" as const }}>
            <div>
              <p style={{ color:"white", fontWeight:700, fontSize:16, margin:"0 0 4px" }}>Want to appear on the leaderboard?</p>
              <p style={{ color:"#6b7280", fontSize:14, margin:0 }}>Create a prediction market and start climbing the ranks.</p>
            </div>
            <Link href="/create" style={{ padding:"12px 24px", borderRadius:12, background:"linear-gradient(135deg,#22d3ee,#3b82f6)", color:"black", fontWeight:700, fontSize:14, textDecoration:"none", whiteSpace:"nowrap" as const }}>Create Market →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
