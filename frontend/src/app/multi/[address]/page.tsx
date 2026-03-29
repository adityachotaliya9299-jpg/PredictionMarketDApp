"use client";
import { useParams } from "next/navigation";
import { useMultiMarketDetail, useBuyMultiShares, useClaimMultiReward, useResolveMultiMarket } from "@/hooks/useMultiOutcome";
import { formatETH, formatTimeLeft, formatTimestamp, shortenAddress } from "@/lib/utils";
import { ArrowLeft, Clock, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { useState, useEffect } from "react";

const COLORS = ["#22d3ee","#a855f7","#f97316","#10b981","#f59e0b","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6"];

export default function MultiMarketPage() {
  const params = useParams();
  const marketAddress = params.address as `0x${string}`;
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const market = useMultiMarketDetail(marketAddress);
  const { buyShares, isPending, isConfirming } = useBuyMultiShares(marketAddress);
  const { claimReward, isPending: claimPending, isConfirming: claimConfirming, isSuccess: claimSuccess } = useClaimMultiReward(marketAddress);
  const { resolve, isPending: resolvePending, isConfirming: resolveConfirming } = useResolveMultiMarket(marketAddress);

  if (!mounted || market.isLoading) return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 16px" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={{ height:400, borderRadius:16, background:"rgba(255,255,255,0.04)", animation:"pulse 2s infinite" }}/>
    </div>
  );

  const now = Math.floor(Date.now() / 1000);
  const expired = now >= Number(market.expirationTime);
  const isOpen = !market.resolved && !expired;
  const totalPool = market.totalPool;

  const getPct = (pool: bigint) => {
    if (totalPool === BigInt(0)) return (100 / Math.max(market.outcomes.length, 1)).toFixed(1);
    return ((Number(pool) / Number(totalPool)) * 100).toFixed(1);
  };

  const handleBuy = async () => {
    if (selected === null) { setError("Select an outcome"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Enter amount"); return; }
    setError("");
    try {
      await buyShares(selected, amount);
      setSuccess(true); setAmount(""); setSelected(null);
      setTimeout(() => { setSuccess(false); market.refetch(); }, 2000);
    } catch(e: any) { setError(e?.shortMessage || e?.message || "Failed"); }
  };

  const card = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, marginBottom:16 };

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 48px", boxSizing:"border-box" as const }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .outcome-btn:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.3)}
        @media(max-width:768px){.multi-grid{grid-template-columns:1fr!important}}
      `}</style>

      <Link href="/multi" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#6b7280", textDecoration:"none", fontSize:14, marginBottom:20 }}>
        <ArrowLeft size={16}/>Multi-Outcome Markets
      </Link>

      {/* Header */}
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" as const }}>
          <span style={{ padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:"rgba(168,85,247,0.15)", color:"#a855f7", border:"1px solid rgba(168,85,247,0.3)" }}>
            MULTI-OUTCOME
          </span>
          <span style={{ padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:700,
            background: isOpen?"rgba(16,185,129,0.1)":expired&&!market.resolved?"rgba(251,191,36,0.1)":"rgba(59,130,246,0.1)",
            color: isOpen?"#10b981":expired&&!market.resolved?"#fbbf24":"#3b82f6",
            border: `1px solid ${isOpen?"rgba(16,185,129,0.3)":expired&&!market.resolved?"rgba(251,191,36,0.3)":"rgba(59,130,246,0.3)"}` }}>
            {isOpen?"LIVE":expired&&!market.resolved?"EXPIRED":"RESOLVED"}
          </span>
        </div>
        <h1 style={{ color:"white", fontSize:"clamp(16px,3vw,22px)", fontWeight:800, lineHeight:1.3, marginBottom:14 }}>
          {market.question}
        </h1>
        <div style={{ display:"flex", flexWrap:"wrap" as const, gap:16, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <TrendingUp size={14} color="#22d3ee"/>
            <span style={{ color:"white", fontWeight:700, fontFamily:"monospace" }}>{formatETH(totalPool)}</span>
            <span style={{ color:"#6b7280", fontSize:13 }}>total pool</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Clock size={14} color="#fbbf24"/>
            <span style={{ color:"#9ca3af", fontSize:13 }}>
              {market.resolved ? `Resolved ${formatTimestamp(BigInt(Math.floor(Date.now()/1000)))}` : formatTimeLeft(market.expirationTime)}
            </span>
          </div>
          <a href={`https://sepolia.etherscan.io/address/${marketAddress}`} target="_blank" rel="noopener noreferrer" style={{ color:"#6b7280", display:"flex" }}>
            <ExternalLink size={14}/>
          </a>
        </div>
      </div>

      <div className="multi-grid" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }}>
        {/* Left: Outcomes */}
        <div>
          <div style={card}>
            <h3 style={{ color:"white", fontWeight:700, fontSize:14, marginBottom:16 }}>Outcomes & Probabilities</h3>
            {market.outcomes.map((outcome, i) => {
              const pool = market.pools[i] ?? BigInt(0);
              const pct = getPct(pool);
              const color = COLORS[i % COLORS.length];
              const isWinner = market.resolved && market.winningOutcome === i;
              return (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }}/>
                      <span style={{ color:isWinner?"#fbbf24":"white", fontWeight:isWinner?700:500, fontSize:14 }}>
                        {outcome} {isWinner && "🏆"}
                      </span>
                    </div>
                    <div style={{ textAlign:"right" as const }}>
                      <span style={{ color, fontWeight:700, fontFamily:"monospace", fontSize:14 }}>{pct}%</span>
                      <span style={{ color:"#6b7280", fontSize:12, marginLeft:8 }}>{formatETH(pool)}</span>
                    </div>
                  </div>
                  <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width 0.5s ease", opacity:isWinner?1:0.7 }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pool breakdown */}
          <div style={card}>
            <h3 style={{ color:"white", fontWeight:700, fontSize:14, marginBottom:14 }}>Pool Breakdown</h3>
            {market.outcomes.map((outcome, i) => {
              const pool = market.pools[i] ?? BigInt(0);
              const color = COLORS[i % COLORS.length];
              return (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:i<market.outcomes.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
                    <span style={{ color:"#9ca3af", fontSize:13 }}>{outcome}</span>
                  </div>
                  <span style={{ color, fontFamily:"monospace", fontSize:13 }}>{formatETH(pool)}</span>
                </div>
              );
            })}
            <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:8, marginTop:8 }}>
              <span style={{ color:"#9ca3af", fontSize:13, fontWeight:600 }}>Total Pool</span>
              <span style={{ color:"#22d3ee", fontFamily:"monospace", fontWeight:700 }}>{formatETH(totalPool)}</span>
            </div>
          </div>
        </div>

        {/* Right: Trade / Claim */}
        <div style={{ position:"sticky", top:80 }}>
          {/* Trade panel */}
          {isOpen && (
            <div style={{ ...card, marginBottom:16 }}>
              <h3 style={{ color:"white", fontWeight:700, fontSize:15, marginBottom:16 }}>Place Trade</h3>

              {!isConnected ? (
                <p style={{ color:"#6b7280", fontSize:14, textAlign:"center" }}>Connect wallet to trade</p>
              ) : success ? (
                <div style={{ textAlign:"center", padding:16 }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
                  <p style={{ color:"#10b981", fontWeight:700 }}>Trade placed!</p>
                </div>
              ) : (
                <>
                  <p style={{ color:"#6b7280", fontSize:12, marginBottom:10 }}>Select outcome:</p>
                  <div style={{ display:"flex", flexDirection:"column" as const, gap:8, marginBottom:16 }}>
                    {market.outcomes.map((outcome, i) => {
                      const color = COLORS[i % COLORS.length];
                      const pct = getPct(market.pools[i] ?? BigInt(0));
                      return (
                        <button key={i} className="outcome-btn" onClick={()=>setSelected(i)}
                          style={{ padding:"10px 14px", borderRadius:10, border:selected===i?`2px solid ${color}`:"1px solid rgba(255,255,255,0.08)", background:selected===i?`${color}18`:"rgba(255,255,255,0.03)", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.2s" }}>
                          <span style={{ color:selected===i?color:"white", fontWeight:600, fontSize:13 }}>{outcome}</span>
                          <span style={{ color:"#6b7280", fontSize:12, fontFamily:"monospace" }}>{pct}%</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ color:"#9ca3af", fontSize:12 }}>Amount (ETH)</span>
                      <span style={{ color:"#6b7280", fontSize:12 }}>Bal: {balance ? formatETH(balance.value, 4) : "—"}</span>
                    </div>
                    <div style={{ position:"relative" }}>
                      <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setError("");}} placeholder="0.0"
                        style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:`1px solid ${error?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.1)"}`, borderRadius:10, padding:"11px 44px 11px 14px", color:"white", fontSize:15, fontFamily:"monospace", outline:"none", boxSizing:"border-box" as const }}/>
                      <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#6b7280", fontSize:13 }}>ETH</span>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:8 }}>
                      {["0.01","0.05","0.1","0.5"].map(q=>(
                        <button key={q} onClick={()=>setAmount(q)} style={{ flex:1, padding:"5px 0", borderRadius:8, fontSize:11, fontFamily:"monospace", cursor:"pointer", border:amount===q?"1px solid rgba(34,211,238,0.4)":"1px solid rgba(255,255,255,0.06)", background:amount===q?"rgba(34,211,238,0.1)":"transparent", color:amount===q?"#22d3ee":"#6b7280" }}>{q}</button>
                      ))}
                    </div>
                  </div>

                  {error && <div style={{ color:"#ef4444", fontSize:12, marginBottom:10, padding:"8px 12px", background:"rgba(239,68,68,0.1)", borderRadius:8 }}>{error}</div>}

                  <button onClick={handleBuy} disabled={isPending||isConfirming||selected===null||!amount}
                    style={{ width:"100%", padding:13, borderRadius:12, fontWeight:700, fontSize:15, cursor:isPending||isConfirming||selected===null||!amount?"not-allowed":"pointer", opacity:selected===null||!amount?0.5:1, border:"none",
                      background:selected!==null?`linear-gradient(135deg,${COLORS[selected%COLORS.length]},${COLORS[(selected+1)%COLORS.length]})`:"rgba(255,255,255,0.1)", color:"black",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    {isPending?"⏳ Confirm...":isConfirming?"⏳ Confirming...":selected!==null&&amount?`⚡ Buy ${market.outcomes[selected]} — ${amount} ETH`:"Select outcome & amount"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Resolve */}
          {expired && !market.resolved && (
            <div style={{ ...card, background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.25)" }}>
              <p style={{ color:"#fbbf24", fontWeight:700, marginBottom:8 }}>🕐 Ready to Resolve</p>
              <p style={{ color:"#9ca3af", fontSize:13, marginBottom:12 }}>Market expired. Oracle must be set before resolving.</p>
              <button onClick={async()=>{try{await resolve();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                disabled={resolvePending||resolveConfirming}
                style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(251,191,36,0.2)", border:"1px solid rgba(251,191,36,0.4)", color:"#fbbf24", fontWeight:700, cursor:"pointer" }}>
                {resolvePending||resolveConfirming?"⏳ Resolving...":"🔄 Resolve Market"}
              </button>
            </div>
          )}

          {/* Claim */}
          {market.resolved && market.expectedPayout > BigInt(0) && !market.hasClaimed && (
            <div style={{ ...card, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)" }}>
              <p style={{ color:"white", fontWeight:700, marginBottom:8 }}>🏆 You Won!</p>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, padding:"10px 14px", background:"rgba(0,0,0,0.2)", borderRadius:10 }}>
                <span style={{ color:"#9ca3af" }}>Your payout</span>
                <span style={{ color:"#10b981", fontFamily:"monospace", fontWeight:700 }}>{formatETH(market.expectedPayout)}</span>
              </div>
              {claimSuccess ? (
                <div style={{ padding:"10px", borderRadius:10, background:"rgba(16,185,129,0.15)", color:"#10b981", textAlign:"center", fontWeight:600 }}>✅ Claimed!</div>
              ) : (
                <button onClick={async()=>{try{await claimReward();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                  disabled={claimPending||claimConfirming}
                  style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,#10b981,#22d3ee)", border:"none", color:"black", fontWeight:700, fontSize:15, cursor:"pointer" }}>
                  {claimPending||claimConfirming?"⏳ Claiming...":"🎁 Claim "+formatETH(market.expectedPayout)}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
