"use client";
import { useParams } from "next/navigation";
import { useUSDCMarketDetail, useBuyUSDCShares, useClaimUSDCReward, useApproveUSDC, useUSDCAllowance, useUSDCBalance } from "@/hooks/useUSDCMarket";
import { formatTimeLeft, formatTimestamp, shortenAddress } from "@/lib/utils";
import { ArrowLeft, Clock, TrendingUp, ExternalLink, DollarSign } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "viem";
import { USDC_FACTORY_ADDRESS } from "@/lib/contracts";

export default function USDCMarketDetailPage() {
  const params = useParams();
  const marketAddress = params.address as `0x${string}`;
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [side, setSide] = useState<"YES"|"NO">("YES");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const market = useUSDCMarketDetail(marketAddress);
  const usdcBalance = useUSDCBalance(address);
  const { data: allowance, refetch: refetchAllowance } = useUSDCAllowance(address, marketAddress);
  const { approve, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveSuccess } = useApproveUSDC(marketAddress);
  const { buyYes, buyNo, isPending, isConfirming } = useBuyUSDCShares(marketAddress);
  const { claimReward, isPending: claimPending, isConfirming: claimConfirming, isSuccess: claimSuccess } = useClaimUSDCReward(marketAddress);

  const parsedAmount = (() => { try { return amount ? parseUnits(amount, 6) : BigInt(0); } catch { return BigInt(0); } })();
  const needsApproval = parsedAmount > BigInt(0) && !approveSuccess && (allowance === undefined || (allowance as bigint) < parsedAmount);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError("Enter USDC amount"); return; }
    setError("");
    try {
      if (side === "YES") await buyYes(amount); else await buyNo(amount);
      setSuccess(true); setAmount("");
      setTimeout(() => { setSuccess(false); market.refetch(); }, 2000);
    } catch(e: any) { setError(e?.shortMessage || "Failed"); }
  };

  const card = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, marginBottom:16 };
  const now = Math.floor(Date.now()/1000);
  const expired = now >= Number(market.expirationTime);
  const isOpen = !market.resolved && !expired;

  if (!mounted || market.isLoading) return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 16px" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={{ height:400, borderRadius:16, background:"rgba(255,255,255,0.04)", animation:"pulse 2s infinite" }}/>
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px 48px", boxSizing:"border-box" as const }}>
      <style>{`.detail-grid{display:grid;grid-template-columns:1fr 360px;gap:20px}.mob-panel{display:none}@media(max-width:768px){.detail-grid{grid-template-columns:1fr!important}.desk-panel{display:none!important}.mob-panel{display:block!important}}`}</style>

      <Link href="/usdc" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#6b7280", textDecoration:"none", fontSize:14, marginBottom:20 }}>
        <ArrowLeft size={16}/>USDC Markets
      </Link>

      {/* Header */}
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" as const }}>
          <span style={{ padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:"rgba(34,197,94,0.15)", color:"#22c55e", border:"1px solid rgba(34,197,94,0.3)" }}>💵 USDC</span>
          <span style={{ padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:isOpen?"rgba(16,185,129,0.1)":"rgba(251,191,36,0.1)", color:isOpen?"#10b981":"#fbbf24", border:`1px solid ${isOpen?"rgba(16,185,129,0.3)":"rgba(251,191,36,0.3)"}` }}>
            {market.resolved?"RESOLVED":expired?"EXPIRED":"LIVE"}
          </span>
        </div>
        <h1 style={{ color:"white", fontSize:"clamp(16px,3vw,22px)", fontWeight:800, lineHeight:1.3, marginBottom:14 }}>{market.question}</h1>
        <div style={{ display:"flex", flexWrap:"wrap" as const, gap:16, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <DollarSign size={14} color="#22c55e"/>
            <span style={{ color:"white", fontWeight:700, fontFamily:"monospace" }}>{formatUnits(market.totalPool, 6)} USDC</span>
            <span style={{ color:"#6b7280", fontSize:13 }}>pool</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Clock size={14} color="#fbbf24"/>
            <span style={{ color:"#9ca3af", fontSize:13 }}>{formatTimeLeft(market.expirationTime)}</span>
          </div>
          <a href={`https://sepolia.etherscan.io/address/${marketAddress}`} target="_blank" rel="noopener noreferrer" style={{ color:"#6b7280", display:"flex" }}>
            <ExternalLink size={14}/>
          </a>
        </div>
      </div>

      {/* Mobile trade panel */}
      <div className="mob-panel" style={{ marginBottom:16 }}>
        {isOpen&&isConnected&&(
          <div style={card}>
            <h3 style={{ color:"white", fontWeight:700, fontSize:15, marginBottom:16 }}>Trade with USDC</h3>
            <p style={{ color:"#6b7280", fontSize:12, marginBottom:12 }}>Balance: {usdcBalance.formatted} USDC</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              {(["YES","NO"] as const).map(s=>(
                <button key={s} onClick={()=>setSide(s)} style={{ padding:"11px 0", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer", border:side===s?`1px solid ${s==="YES"?"rgba(16,185,129,0.5)":"rgba(239,68,68,0.5)"}`:"1px solid rgba(255,255,255,0.08)", background:side===s?(s==="YES"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)"):"transparent", color:side===s?(s==="YES"?"#10b981":"#ef4444"):"#6b7280" }}>
                  {s==="YES"?"▲":"▼"} {s} {s==="YES"?market.yesPct:market.noPct}%
                </button>
              ))}
            </div>
            <div style={{ position:"relative", marginBottom:12 }}>
              <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setError("");}} placeholder="0.0"
                style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"11px 60px 11px 14px", color:"white", fontSize:15, fontFamily:"monospace", outline:"none", boxSizing:"border-box" as const }}/>
              <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#22c55e", fontSize:13, fontWeight:600 }}>USDC</span>
            </div>
            {error&&<div style={{ color:"#ef4444", fontSize:12, marginBottom:8, padding:"7px 12px", background:"rgba(239,68,68,0.1)", borderRadius:8 }}>{error}</div>}
            {needsApproval?(
              <button onClick={async()=>{try{await approve(amount);setTimeout(()=>refetchAllowance(),2000);}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                disabled={approvePending||approveConfirming}
                style={{ width:"100%", padding:12, borderRadius:10, background:"linear-gradient(135deg,#fbbf24,#f97316)", border:"none", color:"black", fontWeight:700, cursor:"pointer" }}>
                {approvePending||approveConfirming?"⏳ Approving...":"✅ Approve USDC"}
              </button>
            ):(
              <button onClick={handleTrade} disabled={isPending||isConfirming||!amount}
                style={{ width:"100%", padding:12, borderRadius:10, border:"none", color:side==="YES"?"black":"white", fontWeight:700, cursor:!amount?"not-allowed":"pointer", opacity:!amount?0.5:1,
                  background:side==="YES"?"linear-gradient(135deg,#10b981,#22d3ee)":"linear-gradient(135deg,#ef4444,#f97316)" }}>
                {isPending?"⏳ Confirm...":isConfirming?"⏳ Confirming...":`Buy ${side} — ${amount||"0"} USDC`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="detail-grid">
        {/* Left */}
        <div>
          <div style={card}>
            <h3 style={{ color:"white", fontWeight:700, marginBottom:14, fontSize:14 }}>Probability</h3>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ color:"#10b981", fontWeight:700, fontFamily:"monospace" }}>YES {market.yesPct}%</span>
              <span style={{ color:"#ef4444", fontWeight:700, fontFamily:"monospace" }}>NO {market.noPct}%</span>
            </div>
            <div style={{ height:10, borderRadius:99, background:"rgba(239,68,68,0.15)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${market.yesPct}%`, background:"linear-gradient(90deg,#10b981,#22d3ee)", borderRadius:99, transition:"width 0.5s" }}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
              <div style={{ padding:14, borderRadius:12, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", textAlign:"center" }}>
                <div style={{ fontSize:24, fontWeight:900, fontFamily:"monospace", color:"#10b981" }}>{market.yesPct}%</div>
                <div style={{ color:"#6b7280", fontSize:12, marginTop:4 }}>YES Pool: {formatUnits(market.yesPool,6)} USDC</div>
              </div>
              <div style={{ padding:14, borderRadius:12, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", textAlign:"center" }}>
                <div style={{ fontSize:24, fontWeight:900, fontFamily:"monospace", color:"#ef4444" }}>{market.noPct}%</div>
                <div style={{ color:"#6b7280", fontSize:12, marginTop:4 }}>NO Pool: {formatUnits(market.noPool,6)} USDC</div>
              </div>
            </div>
          </div>

          {(market.userYesShares > BigInt(0) || market.userNoShares > BigInt(0)) && (
            <div style={card}>
              <h3 style={{ color:"white", fontWeight:700, marginBottom:14, fontSize:14 }}>Your Position</h3>
              {market.userYesShares > BigInt(0) && (
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
                  <span style={{ color:"#9ca3af", fontSize:13 }}>YES Shares</span>
                  <span style={{ color:"#10b981", fontFamily:"monospace" }}>{formatUnits(market.userYesShares,6)} USDC</span>
                </div>
              )}
              {market.userNoShares > BigInt(0) && (
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
                  <span style={{ color:"#9ca3af", fontSize:13 }}>NO Shares</span>
                  <span style={{ color:"#ef4444", fontFamily:"monospace" }}>{formatUnits(market.userNoShares,6)} USDC</span>
                </div>
              )}
            </div>
          )}

          {market.resolved && !market.hasClaimed && (market.userYesShares > BigInt(0) || market.userNoShares > BigInt(0)) && (
            <div style={{ ...card, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)" }}>
              <p style={{ color:"white", fontWeight:700, marginBottom:12 }}>🏆 Claim Your USDC Reward</p>
              {claimSuccess?(
                <div style={{ padding:"10px", borderRadius:10, background:"rgba(16,185,129,0.15)", color:"#10b981", textAlign:"center", fontWeight:600 }}>✅ Claimed!</div>
              ):(
                <button onClick={async()=>{try{await claimReward();market.refetch();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                  disabled={claimPending||claimConfirming}
                  style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,#10b981,#22d3ee)", border:"none", color:"black", fontWeight:700, fontSize:15, cursor:"pointer" }}>
                  {claimPending||claimConfirming?"⏳ Claiming...":"🎁 Claim USDC Reward"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right - Desktop only */}
        <div className="desk-panel" style={{ position:"sticky", top:80 }}>
          {isOpen && isConnected ? (
            <div style={card}>
              <h3 style={{ color:"white", fontWeight:700, fontSize:15, marginBottom:16 }}>Trade with USDC</h3>
              <p style={{ color:"#6b7280", fontSize:12, marginBottom:12 }}>Balance: <span style={{ color:"#22c55e", fontWeight:600 }}>{usdcBalance.formatted} USDC</span></p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {(["YES","NO"] as const).map(s=>(
                  <button key={s} onClick={()=>setSide(s)} style={{ padding:"11px 0", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer", border:side===s?`1px solid ${s==="YES"?"rgba(16,185,129,0.5)":"rgba(239,68,68,0.5)"}`:"1px solid rgba(255,255,255,0.08)", background:side===s?(s==="YES"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)"):"transparent", color:side===s?(s==="YES"?"#10b981":"#ef4444"):"#6b7280" }}>
                    {s==="YES"?"▲":"▼"} {s} {s==="YES"?market.yesPct:market.noPct}%
                  </button>
                ))}
              </div>
              <div style={{ position:"relative", marginBottom:12 }}>
                <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setError("");}} placeholder="0.0"
                  style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"11px 60px 11px 14px", color:"white", fontSize:15, fontFamily:"monospace", outline:"none", boxSizing:"border-box" as const }}/>
                <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#22c55e", fontSize:13, fontWeight:600 }}>USDC</span>
              </div>
              <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                {["1","5","10","50"].map(q=>(
                  <button key={q} onClick={()=>setAmount(q)} style={{ flex:1, padding:"5px 0", borderRadius:8, fontSize:11, fontFamily:"monospace", cursor:"pointer", border:amount===q?"1px solid rgba(34,197,94,0.4)":"1px solid rgba(255,255,255,0.06)", background:amount===q?"rgba(34,197,94,0.1)":"transparent", color:amount===q?"#22c55e":"#6b7280" }}>{q}</button>
                ))}
              </div>
              {error&&<div style={{ color:"#ef4444", fontSize:12, marginBottom:10, padding:"8px 12px", background:"rgba(239,68,68,0.1)", borderRadius:8 }}>{error}</div>}
              {needsApproval?(
                <button onClick={async()=>{try{await approve(amount);setTimeout(()=>refetchAllowance(),2000);}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                  disabled={approvePending||approveConfirming}
                  style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,#fbbf24,#f97316)", border:"none", color:"black", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                  {approvePending||approveConfirming?"⏳ Approving...":"✅ Approve USDC"}
                </button>
              ):(
                <button onClick={handleTrade} disabled={isPending||isConfirming||!amount}
                  style={{ width:"100%", padding:13, borderRadius:12, border:"none", color:side==="YES"?"black":"white", fontWeight:700, fontSize:15, cursor:!amount?"not-allowed":"pointer", opacity:!amount?0.5:1,
                    background:side==="YES"?"linear-gradient(135deg,#10b981,#22d3ee)":"linear-gradient(135deg,#ef4444,#f97316)" }}>
                  {isPending?"⏳ Confirm...":isConfirming?"⏳ Confirming...":`⚡ Buy ${side} — ${amount||"0"} USDC`}
                </button>
              )}
              <p style={{ color:"#4b5563", fontSize:11, textAlign:"center", marginTop:8 }}>Need Sepolia USDC? Get from Circle faucet</p>
            </div>
          ) : !isConnected ? (
            <div style={{ ...card, textAlign:"center" }}>
              <p style={{ color:"#6b7280", fontSize:14 }}>Connect wallet to trade</p>
            </div>
          ) : (
            <div style={{ ...card, textAlign:"center" }}>
              <p style={{ color:"#6b7280", fontSize:14 }}>Market is {market.resolved?"resolved":"expired"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
