"use client";
import { useAccount } from "wagmi";
import { useMarketsByCreator, useActiveMarkets } from "@/hooks/useMarket";
import { MarketCard } from "@/components/market/MarketCard";
import { type MarketMetadata } from "@/types/market";
import { LayoutDashboard, Plus, Globe, Wallet } from "lucide-react";
import Link from "next/link";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { data: createdMarkets, isLoading } = useMarketsByCreator(address);
  const { data: allMarkets } = useActiveMarkets();

  if (!isConnected) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 16px" }}>
        <div style={{ textAlign:"center", maxWidth:360 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <Wallet size={28} color="#6b7280"/>
          </div>
          <h2 style={{ color:"white", fontSize:20, fontWeight:700, margin:"0 0 8px" }}>Your Portfolio</h2>
          <p style={{ color:"#6b7280", fontSize:14, margin:"0 0 24px" }}>Connect your wallet using the button in the top navbar to view your markets.</p>
          <Link href="/" style={{ display:"inline-block", padding:"10px 24px", background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.3)", borderRadius:10, color:"#22d3ee", textDecoration:"none", fontSize:14, fontWeight:500 }}>
            Browse Markets
          </Link>
        </div>
      </div>
    );
  }

  const myMarkets = (createdMarkets as MarketMetadata[] | undefined) ?? [];
  const all = (allMarkets as MarketMetadata[] | undefined) ?? [];

  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"48px 24px", width:"100%", boxSizing:"border-box" as const }}>
      <h1 style={{ color:"white", fontSize:28, fontWeight:800, marginBottom:8 }}>Portfolio</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:40 }}>Your created markets and positions</p>

      <section style={{ marginBottom:48 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ color:"white", fontSize:18, fontWeight:700, display:"flex", alignItems:"center", gap:8, margin:0 }}>
            <Globe size={18} color="#22d3ee"/> Markets You Created
            <span style={{ color:"#6b7280", fontFamily:"monospace", fontSize:14 }}>({myMarkets.length})</span>
          </h2>
          <Link href="/create" style={{ display:"flex", alignItems:"center", gap:6, color:"#22d3ee", textDecoration:"none", fontSize:14 }}>
            <Plus size={16}/>New Market
          </Link>
        </div>
        {isLoading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {[1,2,3].map(i=><div key={i} style={{ height:180, borderRadius:16, background:"rgba(255,255,255,0.03)", animation:"pulse 2s infinite" }}/>)}
          </div>
        ) : myMarkets.length === 0 ? (
          <div style={{ border:"1px dashed rgba(255,255,255,0.08)", borderRadius:16, padding:48, textAlign:"center" }}>
            <p style={{ color:"#4b5563", marginBottom:16 }}>No markets created yet.</p>
            <Link href="/create" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", background:"rgba(34,211,238,0.08)", border:"1px solid rgba(34,211,238,0.2)", borderRadius:10, color:"#22d3ee", textDecoration:"none", fontSize:14 }}>
              <Plus size={16}/>Create Your First Market
            </Link>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {myMarkets.map(m=><MarketCard key={m.marketId} market={m}/>)}
          </div>
        )}
      </section>

      {all.length > 0 && (
        <section>
          <h2 style={{ color:"white", fontSize:18, fontWeight:700, display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <Globe size={18} color="#10b981"/>All Active Markets
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {all.slice(0,6).map(m=><MarketCard key={m.marketId} market={m}/>)}
          </div>
        </section>
      )}
    </div>
  );
}
