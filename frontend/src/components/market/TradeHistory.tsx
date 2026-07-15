"use client";
import { useSubgraphMarketTrades } from "@/hooks/useSubgraph";
import { formatETH, shortenAddress, formatTimestamp } from "@/lib/utils";

export function TradeHistory({ marketAddress }: { marketAddress: string }) {
  const { data, isLoading } = useSubgraphMarketTrades(marketAddress);
  const trades = data?.trades ?? [];

  return (
    <div style={{ background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, overflow:"hidden", marginTop:16 }}>
      <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(var(--fg-rgb),0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <h3 style={{ color:"var(--text)", fontWeight:700, fontSize:14, margin:0 }}>Trade History</h3>
        <span style={{ color:"var(--faint)", fontSize:12 }}>{trades.length} trades</span>
      </div>
      {isLoading ? (
        <div style={{ padding:24, textAlign:"center", color:"var(--faint)", fontSize:13 }}>Loading trades...</div>
      ) : trades.length === 0 ? (
        <div style={{ padding:24, textAlign:"center", color:"var(--faint)", fontSize:13 }}>No trades yet — be the first!</div>
      ) : (
        <div>
          <div style={{ padding:"10px 20px", borderBottom:"1px solid rgba(var(--fg-rgb),0.04)", display:"grid", gridTemplateColumns:"1fr 80px 100px 140px", gap:12 }}>
            {["Trader","Side","Amount","Time"].map(h => (
              <span key={h} style={{ color:"var(--faint-2)", fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.06em" }}>{h}</span>
            ))}
          </div>
          {trades.map((t: any, i: number) => (
            <div key={t.id} style={{ padding:"12px 20px", borderBottom:i<trades.length-1?"1px solid rgba(var(--fg-rgb),0.04)":"none", display:"grid", gridTemplateColumns:"1fr 80px 100px 140px", gap:12, alignItems:"center" }}>
              <a href={`https://sepolia.etherscan.io/address/${t.trader}`} target="_blank" rel="noopener noreferrer"
                style={{ color:"var(--accent)", fontFamily:"var(--font-mono)", fontSize:13, textDecoration:"none" }}>
                {shortenAddress(t.trader)}
              </a>
              <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, display:"inline-block", background:t.isYes?"rgba(var(--up-rgb),0.15)":"rgba(var(--down-rgb),0.15)", color:t.isYes?"var(--up)":"var(--down)" }}>
                {t.isYes ? "YES" : "NO"}
              </span>
              <span style={{ color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:13 }}>
                {formatETH(BigInt(t.cost))}
              </span>
              <span style={{ color:"var(--faint)", fontSize:12 }}>
                {formatTimestamp(BigInt(t.timestamp))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
