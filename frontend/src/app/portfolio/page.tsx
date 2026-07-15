"use client";
import { useAccount } from "wagmi";
import { useSubgraphMarkets, useSubgraphUserTrades } from "@/hooks/useSubgraph";
import { useUserRewardStats, useClaimPREDRewards, useClaimReferralEarnings } from "@/hooks/usePhase3";
import { MarketCard } from "@/components/market/MarketCard";
import { type MarketMetadata } from "@/types/market";
import { Plus, Wallet, TrendingUp, Copy, CheckCheck, ArrowUpRight, Zap, Star, Gift } from "lucide-react";
import Link from "next/link";
import { formatETH, formatTimestamp } from "@/lib/utils";
import { useMemo, useState } from "react";
import { formatEther } from "viem";

const css = `
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes glow{0%,100%{opacity:0.5}50%{opacity:1}}

  .port-grid{display:grid;grid-template-columns:280px 1fr;gap:0;min-height:calc(100vh - 64px)}
  .trade-row:hover{background:rgba(var(--fg-rgb),0.03)!important}
  .mkt-btn:hover{opacity:0.85;transform:translateY(-1px)}
  .claim-btn:hover:not(:disabled){opacity:0.9;transform:translateY(-1px)}

  @media(max-width:900px){
    .port-grid{grid-template-columns:1fr!important;flex-direction:column}
    .port-sidebar{border-right:none!important;border-bottom:1px solid rgba(var(--fg-rgb),0.06)!important;padding:24px 16px!important}
    .port-main{padding:24px 16px!important}
  }
  @media(max-width:600px){
    .trade-table-header,.trade-time,.trade-status{display:none!important}
    .trade-row{grid-template-columns:1fr 60px 90px!important}
  }
`;

function StatPill({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{ padding:"16px 18px", borderRadius:14, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.07)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:color, opacity:0.6 }}/>
      <div style={{ color, fontSize:20, fontWeight:900, fontFamily:"var(--font-mono)", letterSpacing:"-0.02em" }}>{value}</div>
      <div style={{ color:"var(--faint)", fontSize:11, marginTop:4, fontWeight:500 }}>{label}</div>
      {sub && <div style={{ color:"var(--faint-2)", fontSize:10, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function RewardCard({ title, amount, unit, pending, color, icon, description, onClaim, isPending, isConfirming, isSuccess, disabled }: any) {
  return (
    <div style={{ padding:20, borderRadius:16, background: pending?"rgba(var(--fg-rgb),0.05)":"rgba(var(--fg-rgb),0.03)", border:`1px solid ${pending?color+"40":"rgba(var(--fg-rgb),0.07)"}`, position:"relative", overflow:"hidden", transition:"all 0.3s" }}>
      {pending && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at top right, ${color}08 0%, transparent 60%)`, pointerEvents:"none" }}/>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:8 }}>{title}</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
            <span style={{ color:pending?color:"var(--faint-2)", fontSize:26, fontWeight:900, fontFamily:"var(--font-mono)", letterSpacing:"-0.02em" }}>{amount}</span>
            <span style={{ color:"var(--faint)", fontSize:13, fontWeight:600 }}>{unit}</span>
          </div>
        </div>
        <div style={{ width:40, height:40, borderRadius:12, background:`${color}15`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      </div>
      <div style={{ color:"var(--faint-2)", fontSize:12, lineHeight:1.6, marginBottom:16 }}>{description}</div>
      {isSuccess ? (
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:10, background:"rgba(var(--up-rgb),0.12)", color:"var(--up)", fontSize:13, fontWeight:600 }}>
          <CheckCheck size={15}/>Claimed successfully!
        </div>
      ) : (
        <button onClick={onClaim} disabled={disabled||isPending||isConfirming} className="claim-btn"
          style={{ width:"100%", padding:"11px", borderRadius:10, border:"none", fontWeight:700, fontSize:13, cursor:!disabled&&!isPending&&!isConfirming?"pointer":"not-allowed", transition:"all 0.2s",
            background:!disabled?`linear-gradient(135deg, ${color}, ${color}99)`:"rgba(var(--fg-rgb),0.05)",
            color:!disabled?"black":"var(--faint-2)", opacity:isPending||isConfirming?0.7:1 }}>
          {isPending?"⏳ Confirm in wallet...":isConfirming?"⏳ Claiming...":!disabled?<span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><Gift size={14}/>Claim {unit} Rewards</span>:"Nothing to claim yet"}
        </button>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const stats = useUserRewardStats();
  const { claim: claimPRED, isPending: predPending, isConfirming: predConfirming, isSuccess: predSuccess } = useClaimPREDRewards();
  const { claim: claimETH, isPending: ethPending, isConfirming: ethConfirming, isSuccess: ethSuccess } = useClaimReferralEarnings();
  const { data: allMarkets, isLoading: marketsLoading } = useSubgraphMarkets();
  const { data: userTrades, isLoading: tradesLoading } = useSubgraphUserTrades(address);
  const [copied, setCopied] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [activeTab, setActiveTab] = useState<"markets"|"trades">("markets");

  const myMarkets = useMemo(() => {
    if (!allMarkets || !address) return [];
    return allMarkets.filter((m: MarketMetadata) => m.creator.toLowerCase() === address.toLowerCase());
  }, [allMarkets, address]);

  const totalVolume = useMemo(() => {
    if (!userTrades) return BigInt(0);
    return userTrades.reduce((acc: bigint, t: any) => acc + BigInt(t.cost), BigInt(0));
  }, [userTrades]);

  const copyReferral = () => {
    if (stats.address) {
      navigator.clipboard.writeText(`${window.location.origin}?ref=${stats.address}`);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{css}</style>
      <div style={{ textAlign:"center", maxWidth:340 }}>
        <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,rgba(var(--accent-rgb),0.15),rgba(var(--accent2-rgb),0.15))", border:"1px solid rgba(var(--accent-rgb),0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:32 }}>🔐</div>
        <h2 style={{ color:"var(--text)", fontSize:22, fontWeight:800, margin:"0 0 8px" }}>Connect Wallet</h2>
        <p style={{ color:"var(--faint)", fontSize:14, lineHeight:1.6, margin:"0 0 24px" }}>Connect your wallet to view your portfolio, rewards, and trade history.</p>
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:12, color:"var(--on-accent)", textDecoration:"none", fontSize:14, fontWeight:700 }}>
          Browse Markets <ArrowUpRight size={15}/>
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{css}</style>

      <div className="port-grid">
        {/* ── SIDEBAR ── */}
        <div className="port-sidebar" style={{ borderRight:"1px solid rgba(var(--fg-rgb),0.06)", padding:"32px 24px", display:"flex", flexDirection:"column" as const, gap:24, background:"rgba(var(--fg-rgb),0.01)" }}>

          {/* Identity */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👤</div>
              <div>
                <div style={{ color:"var(--text)", fontWeight:700, fontSize:14 }}>Your Portfolio</div>
                <div style={{ color:"var(--faint)", fontFamily:"var(--font-mono)", fontSize:11 }}>{address?.slice(0,6)}...{address?.slice(-4)}</div>
              </div>
            </div>

            {/* Key stats */}
            <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
              <StatPill label="Markets Created" value={String(myMarkets.length)} color="var(--accent)"/>
              <StatPill label="Total Trades" value={String(userTrades?.length ?? 0)} color="var(--accent-3)"/>
              <StatPill label="Volume Traded" value={totalVolume > BigInt(0) ? formatETH(totalVolume) : "0 ETH"} color="var(--up)"/>
              <StatPill label="PRED Balance" value={`${stats.predBalanceFmt} PRED`} color="var(--warn)"/>
            </div>
          </div>

          {/* Live Prices */}
          <div>
            <div style={{ color:"var(--faint-2)", fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:10 }}>Live Prices</div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
              {[
                { label:"ETH/USD", value:stats.ethPriceFmt, color:"#627EEA", icon:"Ξ" },
                { label:"BTC/USD", value:stats.btcPriceFmt, color:"#F7931A", icon:"₿" },
              ].map(p => (
                <div key={p.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:10, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:p.color, fontSize:16, fontWeight:700 }}>{p.icon}</span>
                    <span style={{ color:"var(--muted)", fontSize:12 }}>{p.label}</span>
                  </div>
                  <span style={{ color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700 }}>{stats.isLoading?"—":p.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referral */}
          <div>
            <div style={{ color:"var(--faint-2)", fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:10 }}>Referral Program</div>
            <div style={{ padding:"14px", borderRadius:12, background:"rgba(var(--accent3-rgb),0.06)", border:"1px solid rgba(var(--accent3-rgb),0.15)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ color:"var(--accent-3)", fontSize:13, fontWeight:600 }}>👥 {stats.referralCount.toString()} Referral{stats.referralCount!==BigInt(1)?"s":""}</span>
                <span style={{ color:"var(--faint)", fontSize:11 }}>0.5% per trade</span>
              </div>
              <div style={{ color:"var(--faint-2)", fontFamily:"var(--font-mono)", fontSize:10, marginBottom:10, wordBreak:"break-all" as const }}>
                {typeof window!=="undefined"&&stats.address?`${window.location.origin}?ref=${stats.address.slice(0,8)}...`:"—"}
              </div>
              <button onClick={copyReferral} style={{ width:"100%", padding:"8px", borderRadius:8, background:"rgba(var(--accent3-rgb),0.15)", border:"1px solid rgba(var(--accent3-rgb),0.3)", color:"var(--accent-3)", fontWeight:600, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {copied?<><CheckCheck size={12}/>Copied!</>:<><Copy size={12}/>Copy Referral Link</>}
              </button>
            </div>
          </div>

          {/* Create market CTA */}
          <Link href="/create" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", color:"var(--on-accent)", textDecoration:"none", fontWeight:700, fontSize:14, marginTop:"auto", transition:"all 0.2s" }}>
            <Plus size={16}/>Create Market
          </Link>
        </div>

        {/* ── MAIN ── */}
        <div className="port-main" style={{ padding:"32px 32px", overflowY:"auto" as const }}>

          {/* Rewards section */}
          <div style={{ marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <Zap size={16} color="var(--warn)"/>
              <h2 style={{ color:"var(--text)", fontSize:16, fontWeight:700, margin:0 }}>Rewards</h2>
              {(stats.pendingPRED > BigInt(0) || stats.pendingReferralETH > BigInt(0)) && (
                <span style={{ padding:"2px 8px", borderRadius:99, background:"rgba(var(--warn-rgb),0.15)", color:"var(--warn)", fontSize:11, fontWeight:700 }}>CLAIMABLE</span>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
              <RewardCard
                title="PRED Token Rewards" amount={Number(formatEther(stats.pendingPRED)).toFixed(1)} unit="PRED"
                pending={stats.pendingPRED > BigInt(0)} color="var(--accent)" icon="🏅"
                description="Earn 100 PRED per market created · 10 PRED per trade placed"
                onClaim={async()=>{try{await claimPRED();}catch(e:any){setClaimError(e?.shortMessage||"Failed");}}}
                isPending={predPending} isConfirming={predConfirming} isSuccess={predSuccess}
                disabled={stats.pendingPRED <= BigInt(0)}
              />
              <RewardCard
                title="Referral Earnings" amount={Number(formatEther(stats.pendingReferralETH)).toFixed(4)} unit="ETH"
                pending={stats.pendingReferralETH > BigInt(0)} color="var(--accent-3)" icon="🔗"
                description={`${stats.referralCount.toString()} traders referred · earn 0.5% of every trade they make`}
                onClaim={async()=>{try{await claimETH();}catch(e:any){setClaimError(e?.shortMessage||"Failed");}}}
                isPending={ethPending} isConfirming={ethConfirming} isSuccess={ethSuccess}
                disabled={stats.pendingReferralETH <= BigInt(0)}
              />
            </div>
            {claimError && <div style={{ color:"var(--down)", fontSize:13, marginTop:10, padding:"8px 14px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8, border:"1px solid rgba(var(--down-rgb),0.2)" }}>{claimError}</div>}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:2, marginBottom:20, background:"rgba(var(--fg-rgb),0.04)", borderRadius:12, padding:4, width:"fit-content" }}>
            {([["markets","Markets"], ["trades","Trade History"]] as const).map(([t, label])=>(
              <button key={t} onClick={()=>setActiveTab(t)}
                style={{ padding:"8px 18px", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer", border:"none", transition:"all 0.2s",
                  background:activeTab===t?"rgba(var(--accent-rgb),0.15)":"transparent",
                  color:activeTab===t?"var(--accent)":"var(--faint)",
                  boxShadow:activeTab===t?"inset 0 0 0 1px rgba(var(--accent-rgb),0.3)":"none" }}>
                {label} {t==="markets"?`(${myMarkets.length})`:`(${userTrades?.length??0})`}
              </button>
            ))}
          </div>

          {/* Markets tab */}
          {activeTab==="markets" && (
            marketsLoading ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
                {[1,2,3].map(i=><div key={i} style={{ height:180, borderRadius:16, background:"rgba(var(--fg-rgb),0.03)", animation:"pulse 2s infinite" }}/>)}
              </div>
            ) : myMarkets.length === 0 ? (
              <div style={{ padding:"60px 32px", textAlign:"center", border:"1px dashed rgba(var(--fg-rgb),0.08)", borderRadius:20 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🏪</div>
                <p style={{ color:"var(--faint)", fontSize:15, marginBottom:8 }}>No markets created yet</p>
                <p style={{ color:"var(--faint-2)", fontSize:13, marginBottom:24 }}>Create your first market and earn 100 PRED tokens</p>
                <Link href="/create" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:12, color:"var(--on-accent)", textDecoration:"none", fontSize:14, fontWeight:700 }}>
                  <Plus size={15}/>Create First Market
                </Link>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
                {myMarkets.map((m: MarketMetadata) => <MarketCard key={m.marketId} market={m}/>)}
              </div>
            )
          )}

          {/* Trades tab */}
          {activeTab==="trades" && (
            tradesLoading ? (
              <div style={{ padding:24, textAlign:"center", color:"var(--faint)" }}>Loading trades...</div>
            ) : !userTrades || userTrades.length === 0 ? (
              <div style={{ padding:"60px 32px", textAlign:"center", border:"1px dashed rgba(var(--fg-rgb),0.08)", borderRadius:20 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
                <p style={{ color:"var(--faint)", fontSize:15, marginBottom:8 }}>No trades yet</p>
                <p style={{ color:"var(--faint-2)", fontSize:13, marginBottom:24 }}>Place your first trade and earn 10 PRED tokens</p>
                <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"rgba(var(--fg-rgb),0.06)", borderRadius:12, color:"var(--text)", textDecoration:"none", fontSize:14, fontWeight:600, border:"1px solid rgba(var(--fg-rgb),0.1)" }}>
                  Browse Markets <ArrowUpRight size={15}/>
                </Link>
              </div>
            ) : (
              <div style={{ background:"rgba(var(--fg-rgb),0.02)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, overflow:"hidden" }}>
                <div className="trade-table-header" style={{ padding:"10px 20px", borderBottom:"1px solid rgba(var(--fg-rgb),0.05)", display:"grid", gridTemplateColumns:"1fr 70px 100px 80px 130px", gap:12 }}>
                  {["Market","Side","Amount","Status","Time"].map(h=>(
                    <span key={h} style={{ color:"var(--faint-2)", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.08em" }}>{h}</span>
                  ))}
                </div>
                {userTrades.map((t: any, i: number) => (
                  <div key={t.id} className="trade-row" style={{ padding:"13px 20px", borderBottom:i<userTrades.length-1?"1px solid rgba(var(--fg-rgb),0.04)":"none", display:"grid", gridTemplateColumns:"1fr 70px 100px 80px 130px", gap:12, alignItems:"center", transition:"background 0.15s" }}>
                    <Link href={`/markets/${t.market.id}`} style={{ color:"var(--text)", textDecoration:"none", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const, display:"flex", alignItems:"center", gap:6 }}>
                      {t.market.question}
                    </Link>
                    <span style={{ padding:"3px 8px", borderRadius:99, fontSize:11, fontWeight:700, display:"inline-block", textAlign:"center" as const,
                      background:t.isYes?"rgba(var(--up-rgb),0.15)":"rgba(var(--down-rgb),0.15)",
                      color:t.isYes?"var(--up)":"var(--down)" }}>
                      {t.isYes?"YES":"NO"}
                    </span>
                    <span style={{ color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600 }}>{formatETH(BigInt(t.cost))}</span>
                    <span className="trade-status" style={{ padding:"3px 8px", borderRadius:99, fontSize:11, fontWeight:600, display:"inline-block", textAlign:"center" as const,
                      background:t.market.resolved?"rgba(var(--accent2-rgb),0.12)":"rgba(var(--up-rgb),0.12)",
                      color:t.market.resolved?"var(--accent-2)":"var(--up)" }}>
                      {t.market.resolved?"Resolved":"Live"}
                    </span>
                    <span className="trade-time" style={{ color:"var(--faint)", fontSize:11 }}>{formatTimestamp(BigInt(t.timestamp))}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}