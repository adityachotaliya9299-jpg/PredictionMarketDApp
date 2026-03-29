"use client";
import { useState, useMemo, useEffect } from "react";
import { useSubgraphMarkets } from "@/hooks/useSubgraph";
import { useMarketCount } from "@/hooks/useMarket";
import { MarketCard } from "@/components/market/MarketCard";
import { CATEGORIES, type MarketMetadata } from "@/types/market";
import { Search, Zap, Globe, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: markets, isLoading, error } = useSubgraphMarkets();
  const { data: totalCount } = useMarketCount();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

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

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"inherit", maxWidth:1280, margin:"0 auto", boxSizing:"border-box" as const }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* Hero */}
      <div style={{ width:"100%", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:"25%", width:384, height:384, background:"rgba(34,211,238,0.07)", borderRadius:"50%", filter:"blur(80px)", transform:"translateY(-50%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:0, right:"25%", width:384, height:384, background:"rgba(59,130,246,0.07)", borderRadius:"50%", filter:"blur(80px)", transform:"translateY(-50%)", pointerEvents:"none" }}/>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"80px 24px 48px", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:999, border:"1px solid rgba(34,211,238,0.2)", background:"rgba(34,211,238,0.05)", color:"#22d3ee", fontSize:12, fontWeight:600, marginBottom:24 }}>
            <Zap size={12}/>Powered by Smart Contracts
          </div>
          <h1 style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.1, margin:"0 0 16px" }}>
            <span className="gradient-text">Predict the Future,</span><br/>
            <span style={{ color:"white" }}>Earn from Truth</span>
          </h1>
          <p style={{ color:"#9ca3af", fontSize:16, maxWidth:480, margin:"0 auto 32px", lineHeight:1.6 }}>
            Decentralized prediction markets with automated payouts. Trade YES/NO on real events — no middlemen, full transparency.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:12, marginBottom:48 }}>
            <Link href="/create" style={{ padding:"12px 24px", borderRadius:12, background:"#22d3ee", color:"black", fontWeight:700, fontSize:14, textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
              Create Market <ChevronRight size={16}/>
            </Link>
            <a href="#markets" style={{ padding:"12px 24px", borderRadius:12, border:"1px solid rgba(255,255,255,0.12)", color:"#d1d5db", fontWeight:500, fontSize:14, textDecoration:"none" }}>
              Browse Markets
            </a>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:40 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:900, color:"white", fontFamily:"monospace" }}>{String(totalCount ?? 0)}</div>
              <div style={{ color:"#6b7280", fontSize:12, marginTop:2 }}>Total Markets</div>
            </div>
            <div style={{ width:1, height:32, background:"rgba(255,255,255,0.06)" }}/>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:900, color:"white", fontFamily:"monospace" }}>∞</div>
              <div style={{ color:"#6b7280", fontSize:12, marginTop:2 }}>On-chain Oracles</div>
            </div>
            <div style={{ width:1, height:32, background:"rgba(255,255,255,0.06)" }}/>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:900, color:"white", fontFamily:"monospace" }}>0%</div>
              <div style={{ color:"#6b7280", fontSize:12, marginTop:2 }}>Counterparty Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Markets */}
      <div id="markets" style={{ maxWidth:1280, margin:"0 auto", padding:"40px 24px", width:"100%", boxSizing:"border-box" }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6b7280" }}/>
            <input style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 16px 10px 40px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
              placeholder="Search markets..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button style={{ padding:"8px 14px", borderRadius:10, border:!category?"1px solid rgba(34,211,238,0.4)":"1px solid rgba(255,255,255,0.06)", background:!category?"rgba(34,211,238,0.1)":"transparent", color:!category?"#22d3ee":"#6b7280", fontSize:12, fontWeight:600, cursor:"pointer" }} onClick={()=>setCategory(null)}>All</button>
            {CATEGORIES.map(c=>(
              <button key={c} style={{ padding:"8px 14px", borderRadius:10, border:category===c?"1px solid rgba(34,211,238,0.4)":"1px solid rgba(255,255,255,0.06)", background:category===c?"rgba(34,211,238,0.1)":"transparent", color:category===c?"#22d3ee":"#6b7280", fontSize:12, fontWeight:600, cursor:"pointer" }} onClick={()=>setCategory(category===c?null:c)}>{c}</button>
            ))}
          </div>
        </div>

        {isLoading && !timedOut ? (
          <>
            <p style={{ color:"#6b7280", fontSize:14, marginBottom:16 }}>Fetching from Sepolia...</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
              {[1,2,3].map(i=><div key={i} style={{ height:180, borderRadius:16, background:"rgba(255,255,255,0.04)", animation:"pulse 2s infinite" }}/>)}
            </div>
          </>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <Globe size={40} color="#374151" style={{ margin:"0 auto 16px" }}/>
            <p style={{ color:"#6b7280", fontSize:16, marginBottom:8 }}>No markets yet</p>
            <Link href="/create" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", background:"rgba(34,211,238,0.08)", border:"1px solid rgba(34,211,238,0.2)", borderRadius:10, color:"#22d3ee", textDecoration:"none", fontSize:14 }}>
              <Plus size={16}/>Create First Market
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color:"#6b7280", fontSize:14, marginBottom:16 }}>{filtered.length} market{filtered.length!==1?"s":""} found</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
              {filtered.map(m=><MarketCard key={m.marketId} market={m as MarketMetadata}/>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
