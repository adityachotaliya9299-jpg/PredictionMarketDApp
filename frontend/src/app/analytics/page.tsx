"use client";
import { useSubgraphMarkets } from "@/hooks/useSubgraph";
import { useMarketCount } from "@/hooks/useMarket";
import { useSubgraphMultiMarkets } from "@/hooks/useSubgraph";
import { usePREDTotalSupply } from "@/hooks/usePhase3";
import { useTotalStaked } from "@/hooks/useGovernance";
import { type MarketMetadata } from "@/types/market";
import { formatEther } from "viem";
import { BarChart2, TrendingUp, Users, Zap, Globe, DollarSign } from "lucide-react";
import { useMemo } from "react";

const CATEGORY_COLORS: Record<string,string> = {
  Crypto:"#f7931a", Politics:"var(--accent-2)", Sports:"var(--up)", Science:"var(--accent-3)",
  Entertainment:"#f97316", Economics:"var(--accent)", Technology:"var(--warn)", General:"var(--faint)"
};

function StatCard({ label, value, sub, color, icon }: any) {
  return (
    <div style={{ padding:"20px", borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.07)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:color, opacity:0.6 }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ color:"var(--faint)", fontSize:12, marginBottom:8 }}>{label}</div>
          <div style={{ color:color, fontSize:26, fontWeight:900, fontFamily:"var(--font-mono)" }}>{value}</div>
          {sub && <div style={{ color:"var(--faint-2)", fontSize:11, marginTop:4 }}>{sub}</div>}
        </div>
        <div style={{ color:color, opacity:0.7 }}>{icon}</div>
      </div>
    </div>
  );
}

function CategoryBar({ category, count, total }: { category: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const color = CATEGORY_COLORS[category] || "var(--faint)";
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ color:"var(--text)", fontSize:13, fontWeight:500 }}>{category}</span>
        <span style={{ color:color, fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700 }}>{count} ({pct.toFixed(1)}%)</span>
      </div>
      <div style={{ height:8, borderRadius:99, background:"rgba(var(--fg-rgb),0.06)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width 0.8s ease" }}/>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: markets, isLoading } = useSubgraphMarkets();
  const { data: multiMarkets } = useSubgraphMultiMarkets();
  const { data: totalSupply } = usePREDTotalSupply();
  const { data: totalStaked } = useTotalStaked();

  const allMarkets = (markets as MarketMetadata[] | undefined) ?? [];
  const allMulti = (multiMarkets as any[] | undefined) ?? [];

  const stats = useMemo(() => {
    const active = allMarkets.filter(m => m.active).length;
    const resolved = allMarkets.filter(m => !m.active).length;
    const categories: Record<string, number> = {};
    allMarkets.forEach(m => { categories[m.category] = (categories[m.category] || 0) + 1; });
    const creators = new Set(allMarkets.map(m => m.creator.toLowerCase())).size;
    const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    return { active, resolved, categories, sortedCats, creators };
  }, [allMarkets]);

  const predCirculating = totalSupply ? Number(formatEther(totalSupply as bigint)).toFixed(0) : "—";
  const predStaked = totalStaked ? Number(formatEther(totalStaked as bigint)).toFixed(0) : "—";
  const stakedPct = totalSupply && totalStaked && (totalSupply as bigint) > BigInt(0)
    ? ((Number(totalStaked as bigint) / Number(totalSupply as bigint)) * 100).toFixed(1)
    : "0";

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 16px 64px", boxSizing:"border-box" as const }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* Header */}
      <div style={{ marginBottom:36 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(var(--accent-rgb),0.08)", border:"1px solid rgba(var(--accent-rgb),0.2)", color:"var(--accent)", fontSize:12, fontWeight:600, marginBottom:14 }}>
          <BarChart2 size={11}/>Protocol Analytics
        </div>
        <h1 style={{ color:"var(--text)", fontSize:28, fontWeight:900, margin:"0 0 6px" }}>Analytics</h1>
        <p style={{ color:"var(--faint)", fontSize:14, margin:0 }}>Verity protocol statistics — Sepolia Testnet</p>
      </div>

      {/* Key stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:32 }}>
        <StatCard label="Total YES/NO Markets" value={String(allMarkets.length)} color="var(--accent)" icon={<Globe size={24}/>}/>
        <StatCard label="Multi-Outcome Markets" value={String(allMulti.length)} color="var(--accent-3)" icon={<BarChart2 size={24}/>}/>
        <StatCard label="Active Markets" value={String(stats.active)} sub={`${stats.resolved} resolved`} color="var(--up)" icon={<Zap size={24}/>}/>
        <StatCard label="Unique Creators" value={String(stats.creators)} color="var(--warn)" icon={<Users size={24}/>}/>
        <StatCard label="PRED Total Supply" value={predCirculating ? Number(predCirculating).toLocaleString() : "—"} sub="PRED tokens" color="#f97316" icon={<TrendingUp size={24}/>}/>
        <StatCard label="PRED Staked" value={predStaked ? Number(predStaked).toLocaleString() : "—"} sub={`${stakedPct}% of supply`} color="var(--up)" icon={<DollarSign size={24}/>}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
        {/* Market breakdown */}
        <div style={{ background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, padding:24 }}>
          <h2 style={{ color:"var(--text)", fontSize:16, fontWeight:700, marginBottom:20 }}>Market Types</h2>
          {[
            { label:"YES/NO (ETH)", value:allMarkets.length, color:"var(--accent)", icon:"⚡" },
            { label:"Multi-Outcome (ETH)", value:allMulti.length, color:"var(--accent-3)", icon:"🎯" },
            { label:"USDC Markets", value:0, color:"var(--up)", icon:"💵" },
            { label:"Scalar (Price Range)", value:0, color:"var(--warn)", icon:"📊" },
          ].map(t=>(
            <div key={t.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(var(--fg-rgb),0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <span style={{ color:"var(--muted)", fontSize:13 }}>{t.label}</span>
              </div>
              <span style={{ color:t.color, fontWeight:700, fontFamily:"var(--font-mono)", fontSize:15 }}>{t.value}</span>
            </div>
          ))}
        </div>

        {/* Market status */}
        <div style={{ background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, padding:24 }}>
          <h2 style={{ color:"var(--text)", fontSize:16, fontWeight:700, marginBottom:20 }}>Market Status</h2>
          {isLoading ? (
            <div style={{ height:150, borderRadius:10, background:"rgba(var(--fg-rgb),0.04)", animation:"pulse 2s infinite" }}/>
          ) : (
            <>
              {[
                { label:"Active", value:stats.active, color:"var(--up)", pct: allMarkets.length > 0 ? (stats.active/allMarkets.length*100).toFixed(0) : "0" },
                { label:"Resolved", value:stats.resolved, color:"var(--accent-2)", pct: allMarkets.length > 0 ? (stats.resolved/allMarkets.length*100).toFixed(0) : "0" },
              ].map(s=>(
                <div key={s.label} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ color:"var(--text)", fontSize:13 }}>{s.label}</span>
                    <span style={{ color:s.color, fontFamily:"var(--font-mono)", fontWeight:700 }}>{s.value} ({s.pct}%)</span>
                  </div>
                  <div style={{ height:8, borderRadius:99, background:"rgba(var(--fg-rgb),0.06)", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${s.pct}%`, background:s.color, borderRadius:99 }}/>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:16, padding:"12px 16px", borderRadius:12, background:"rgba(var(--accent-rgb),0.06)", border:"1px solid rgba(var(--accent-rgb),0.12)" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"var(--faint)", fontSize:13 }}>Resolution Rate</span>
                  <span style={{ color:"var(--accent)", fontWeight:700, fontFamily:"var(--font-mono)" }}>
                    {allMarkets.length > 0 ? (stats.resolved/allMarkets.length*100).toFixed(1) : "0"}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, padding:24, marginBottom:28 }}>
        <h2 style={{ color:"var(--text)", fontSize:16, fontWeight:700, marginBottom:20 }}>Markets by Category</h2>
        {isLoading ? (
          <div style={{ height:200, borderRadius:10, background:"rgba(var(--fg-rgb),0.04)", animation:"pulse 2s infinite" }}/>
        ) : stats.sortedCats.length === 0 ? (
          <p style={{ color:"var(--faint-2)" }}>No markets yet</p>
        ) : (
          stats.sortedCats.map(([cat, count]) => (
            <CategoryBar key={cat} category={cat} count={count} total={allMarkets.length}/>
          ))
        )}
      </div>

      {/* Recent markets */}
      <div style={{ background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, overflow:"hidden", marginBottom:28 }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(var(--fg-rgb),0.06)" }}>
          <h2 style={{ color:"var(--text)", fontSize:16, fontWeight:700, margin:0 }}>Recent Markets</h2>
        </div>
        <div style={{ padding:"10px 20px", borderBottom:"1px solid rgba(var(--fg-rgb),0.05)", display:"grid", gridTemplateColumns:"1fr 100px 80px", gap:12 }}>
          {["Question","Category","Status"].map(h=><span key={h} style={{ color:"var(--faint-2)", fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.06em" }}>{h}</span>)}
        </div>
        {isLoading ? (
          <div style={{ padding:20, textAlign:"center", color:"var(--faint)" }}>Loading...</div>
        ) : allMarkets.slice(0,10).map((m,i)=>(
          <div key={m.marketId} style={{ padding:"12px 20px", borderBottom:i<9?"1px solid rgba(var(--fg-rgb),0.04)":"none", display:"grid", gridTemplateColumns:"1fr 100px 80px", gap:12, alignItems:"center" }}>
            <span style={{ color:"var(--text)", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{m.question}</span>
            <span style={{ padding:"3px 8px", borderRadius:99, fontSize:11, fontWeight:600, background:`${CATEGORY_COLORS[m.category]||"var(--faint)"}18`, color:CATEGORY_COLORS[m.category]||"var(--faint)" }}>{m.category}</span>
            <span style={{ padding:"3px 8px", borderRadius:99, fontSize:11, fontWeight:600, background:m.active?"rgba(var(--up-rgb),0.1)":"rgba(var(--faint-rgb),0.1)", color:m.active?"var(--up)":"var(--faint)" }}>{m.active?"Active":"Done"}</span>
          </div>
        ))}
      </div>

      {/* Dune link */}
      <div style={{ padding:"20px 24px", borderRadius:16, background:"linear-gradient(135deg,rgba(var(--accent-rgb),0.06),rgba(var(--accent3-rgb),0.06))", border:"1px solid rgba(var(--accent-rgb),0.15)" }}>
        <h3 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:"0 0 8px" }}>📊 Advanced Analytics on Dune</h3>
        <p style={{ color:"var(--faint)", fontSize:14, margin:"0 0 16px" }}>
          For advanced on-chain analytics including volume over time, user growth, and trading patterns — view the Dune dashboard.
        </p>
        <a href="https://dune.com" target="_blank" rel="noopener noreferrer"
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, background:"rgba(var(--accent-rgb),0.1)", border:"1px solid rgba(var(--accent-rgb),0.25)", color:"var(--accent)", textDecoration:"none", fontSize:14, fontWeight:600 }}>
          View Dune Dashboard →
        </a>
      </div>
    </div>
  );
}
