"use client";

import { useParams } from "next/navigation";
import { useMarketDetail } from "@/hooks/useMarket";
import { getMarketStatus, Outcome } from "@/types/market";
import { formatETH, formatTimestamp, formatTimeLeft, shortenAddress } from "@/lib/utils";
import { ArrowLeft, Clock, TrendingUp, ExternalLink, Share2, Twitter } from "lucide-react";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { useBuyShares, useClaimReward, useResolveMarket } from "@/hooks/useTransactions";

function outcomeLabel(o: Outcome): string {
  return ["UNRESOLVED", "YES ✅", "NO ❌", "INVALID ⚠️"][o] ?? "UNRESOLVED";
}

function ProbBar({ yes, no }: { yes: number; no: number }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ color:"var(--up)", fontWeight:700, fontFamily:"var(--font-mono)", fontSize:16 }}>YES {yes.toFixed(1)}%</span>
        <span style={{ color:"var(--down)", fontWeight:700, fontFamily:"var(--font-mono)", fontSize:16 }}>NO {no.toFixed(1)}%</span>
      </div>
      <div style={{ height:10, borderRadius:99, background:"rgba(var(--down-rgb),0.15)", overflow:"hidden", position:"relative" }}>
        <div style={{ height:"100%", width:`${yes}%`, background:"linear-gradient(90deg,var(--up),var(--accent))", borderRadius:99, transition:"width 0.5s ease" }}/>
        <div style={{ position:"absolute", left:"50%", top:0, height:"100%", width:2, background:"rgba(var(--fg-rgb),0.15)" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, color:"var(--faint)", fontSize:11, fontFamily:"var(--font-mono)" }}>
        <span>0%</span><span>50%</span><span>100%</span>
      </div>
    </div>
  );
}

function ShareButtons({ question, yes }: { question: string; yes: number }) {
  const text = `I'm tracking "${question}" — currently ${yes.toFixed(0)}% YES probability on Verity 🎯`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  const copyLink = () => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); };
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" as const }}>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
        style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, background:"rgba(29,161,242,0.15)", border:"1px solid rgba(29,161,242,0.3)", color:"#1da1f2", fontSize:12, fontWeight:600, textDecoration:"none" }}>
        <Twitter size={13}/>Share
      </a>
      <button onClick={copyLink} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, background:"rgba(var(--fg-rgb),0.06)", border:"1px solid rgba(var(--fg-rgb),0.1)", color:"var(--muted)", fontSize:12, cursor:"pointer" }}>
        <Share2 size={13}/>Copy Link
      </button>
    </div>
  );
}

function TradePanel({ marketAddress, probability, feeBps, onSuccess }: {
  marketAddress: `0x${string}`; probability: [bigint, bigint]; feeBps: bigint; onSuccess: () => void;
}) {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { buyYes, buyNo, isPending, isConfirming } = useBuyShares(marketAddress);
  const [side, setSide] = useState<"YES"|"NO">("YES");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const yesPct = Number(probability[0]) / 1e16;
  const noPct = 100 - yesPct;
  const amountWei = (() => { try { return parseEther(amount as `${number}`); } catch { return BigInt(0); } })();
  const fee = amountWei > BigInt(0) ? (amountWei * feeBps) / BigInt(10000) : BigInt(0);
  const net = amountWei - fee;

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError("Enter a valid amount"); return; }
    setError("");
    try {
      if (side === "YES") await buyYes(amount); else await buyNo(amount);
      setSuccess(true); setAmount("");
      setTimeout(() => { setSuccess(false); onSuccess(); }, 2000);
    } catch(e: any) { setError(e?.shortMessage || e?.message || "Transaction failed"); }
  };

  if (!isConnected) return (
    <div style={{ padding:20, borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.08)", textAlign:"center" }}>
      <p style={{ color:"var(--faint)", fontSize:14, marginBottom:4 }}>Connect wallet to trade</p>
      <p style={{ color:"var(--faint-2)", fontSize:12 }}>Use the connect button in the navbar</p>
    </div>
  );

  if (success) return (
    <div style={{ padding:24, borderRadius:16, background:"rgba(var(--up-rgb),0.1)", border:"1px solid rgba(var(--up-rgb),0.3)", textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
      <p style={{ color:"var(--up)", fontWeight:700, marginBottom:4 }}>Trade Confirmed!</p>
      <p style={{ color:"var(--faint)", fontSize:13 }}>Your {side} shares purchased.</p>
    </div>
  );

  return (
    <div style={{ padding:20, borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.08)" }}>
      <h3 style={{ color:"var(--text)", fontWeight:700, fontSize:15, marginBottom:16 }}>Place Trade</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
        {(["YES","NO"] as const).map(s => (
          <button key={s} onClick={()=>setSide(s)} style={{ padding:"11px 0", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer",
            border: side===s?`1px solid ${s==="YES"?"rgba(var(--up-rgb),0.5)":"rgba(var(--down-rgb),0.5)"}`:"1px solid rgba(var(--fg-rgb),0.08)",
            background: side===s?(s==="YES"?"rgba(var(--up-rgb),0.15)":"rgba(var(--down-rgb),0.15)"):"transparent",
            color: side===s?(s==="YES"?"var(--up)":"var(--down)"):"var(--faint)" }}>
            {s==="YES"?"▲":"▼"} {s} — {s==="YES"?yesPct.toFixed(1):noPct.toFixed(1)}%
          </button>
        ))}
      </div>

      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ color:"var(--muted)", fontSize:12 }}>Amount (ETH)</span>
          <span style={{ color:"var(--faint)", fontSize:12 }}>Bal: {balance ? formatETH(balance.value, 4) : "—"}</span>
        </div>
        <div style={{ position:"relative" }}>
          <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setError("");}} placeholder="0.0"
            style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:`1px solid ${error?"rgba(var(--down-rgb),0.5)":"rgba(var(--fg-rgb),0.1)"}`, borderRadius:10, padding:"11px 44px 11px 14px", color:"var(--text)", fontSize:15, fontFamily:"var(--font-mono)", outline:"none", boxSizing:"border-box" as const }}/>
          <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"var(--faint)", fontSize:13 }}>ETH</span>
        </div>
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          {["0.01","0.05","0.1","0.5"].map(q=>(
            <button key={q} onClick={()=>setAmount(q)} style={{ flex:1, padding:"5px 0", borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", cursor:"pointer",
              border:amount===q?"1px solid rgba(var(--accent-rgb),0.4)":"1px solid rgba(var(--fg-rgb),0.06)",
              background:amount===q?"rgba(var(--accent-rgb),0.1)":"transparent", color:amount===q?"var(--accent)":"var(--faint)" }}>{q}</button>
          ))}
        </div>
      </div>

      {amountWei > BigInt(0) && (
        <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:12, fontFamily:"var(--font-mono)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", color:"var(--faint)", marginBottom:4 }}>
            <span>Fee ({Number(feeBps)/100}%)</span><span style={{ color:"var(--down)" }}>-{formatETH(fee, 6)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", color:"var(--text)", fontWeight:700, borderTop:"1px solid rgba(var(--fg-rgb),0.06)", paddingTop:6 }}>
            <span>You get</span><span style={{ color:side==="YES"?"var(--up)":"var(--down)" }}>{formatETH(net, 6)} {side}</span>
          </div>
        </div>
      )}

      {error && <div style={{ color:"var(--down)", fontSize:12, marginBottom:10, padding:"8px 12px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8 }}>{error}</div>}

      <button onClick={handleTrade} disabled={isPending||isConfirming||!amount}
        style={{ width:"100%", padding:13, borderRadius:12, fontWeight:700, fontSize:15, cursor:isPending||isConfirming||!amount?"not-allowed":"pointer", opacity:!amount?0.5:1, border:"none",
          background:side==="YES"?"linear-gradient(135deg,var(--up),var(--accent))":"linear-gradient(135deg,var(--down),#f97316)",
          color:side==="YES"?"black":"white", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        {isPending?"⏳ Confirm...":isConfirming?"⏳ Confirming...":`⚡ Buy ${side}${amount?` — ${amount} ETH`:""}`}
      </button>
      <p style={{ color:"var(--faint-2)", fontSize:11, textAlign:"center", marginTop:8, lineHeight:1.5 }}>Parimutuel pool — winners split proportionally</p>
    </div>
  );
}

function ClaimPanel({ marketAddress, marketInfo, yesShares, noShares, hasClaimed, expectedPayout, onSuccess }: any) {
  const { resolveMarket, isPending: rPending, isConfirming: rConfirming } = useResolveMarket(marketAddress);
  const { claimReward, isPending: cPending, isConfirming: cConfirming } = useClaimReward(marketAddress);
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(false);
  const status = getMarketStatus(marketInfo);
  const userWon = (marketInfo.outcome === Outcome.YES && yesShares > BigInt(0)) ||
    (marketInfo.outcome === Outcome.NO && noShares > BigInt(0)) ||
    (marketInfo.outcome === Outcome.INVALID && (yesShares + noShares) > BigInt(0));

  if (claimed || hasClaimed) return (
    <div style={{ padding:20, borderRadius:16, background:"rgba(var(--up-rgb),0.1)", border:"1px solid rgba(var(--up-rgb),0.3)", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:24 }}>✅</span>
      <div><p style={{ color:"var(--up)", fontWeight:700, margin:0 }}>Reward Claimed!</p><p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>Sent to your wallet.</p></div>
    </div>
  );

  if (status === "expired") return (
    <div style={{ padding:20, borderRadius:16, background:"rgba(var(--warn-rgb),0.1)", border:"1px solid rgba(var(--warn-rgb),0.3)" }}>
      <p style={{ color:"var(--warn)", fontWeight:700, marginBottom:8 }}>🕐 Ready to Resolve</p>
      <p style={{ color:"var(--muted)", fontSize:13, marginBottom:12 }}>Market expired. Trigger resolution if oracle has answered.</p>
      {error && <p style={{ color:"var(--down)", fontSize:12, marginBottom:8 }}>{error}</p>}
      <button onClick={async()=>{try{await resolveMarket();onSuccess();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
        disabled={rPending||rConfirming}
        style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(var(--warn-rgb),0.2)", border:"1px solid rgba(var(--warn-rgb),0.4)", color:"var(--warn)", fontWeight:700, cursor:"pointer" }}>
        {rPending||rConfirming?"⏳ Resolving...":"🔄 Resolve Market"}
      </button>
    </div>
  );

  if ((status === "resolved" || status === "invalid") && userWon && !hasClaimed) return (
    <div style={{ padding:20, borderRadius:16, background:"rgba(var(--up-rgb),0.1)", border:"1px solid rgba(var(--up-rgb),0.3)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <span style={{ fontSize:28 }}>🏆</span>
        <div><p style={{ color:"var(--text)", fontWeight:700, margin:0 }}>You Won!</p><p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>Outcome: {outcomeLabel(marketInfo.outcome)}</p></div>
      </div>
      <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", color:"var(--up)", fontWeight:700, fontSize:15 }}>
          <span>Your payout</span><span>{formatETH(expectedPayout)}</span>
        </div>
      </div>
      {error && <p style={{ color:"var(--down)", fontSize:12, marginBottom:8 }}>{error}</p>}
      <button onClick={async()=>{try{await claimReward();setClaimed(true);onSuccess();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
        disabled={cPending||cConfirming}
        style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--up),var(--accent))", border:"none", color:"var(--on-accent)", fontWeight:700, fontSize:15, cursor:"pointer" }}>
        {cPending||cConfirming?"⏳ Claiming...":"🎁 Claim "+formatETH(expectedPayout)}
      </button>
    </div>
  );
  return null;
}

export default function MarketDetailPage() {
  const params = useParams();
  const marketAddress = params.address as `0x${string}`;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { marketInfo, probability, feeBps, yesShares, noShares, hasClaimed, expectedPayout, isLoading, refetch } = useMarketDetail(marketAddress);

  const card = { background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.08)", borderRadius:16, padding:20, marginBottom:16 };

  if (!mounted || isLoading || !marketInfo || !probability) return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 16px" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={{ height:32, width:120, borderRadius:8, background:"rgba(var(--fg-rgb),0.06)", marginBottom:24, animation:"pulse 2s infinite" }}/>
      <div style={{ height:400, borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", animation:"pulse 2s infinite" }}/>
    </div>
  );

  const status = getMarketStatus(marketInfo);
  const yesPct = Number(probability[0]) / 1e16;
  const noPct = 100 - yesPct;
  const isOpen = status === "open";
  const showClaim = status === "expired" || status === "resolved" || status === "invalid";
  const hasPosition = yesShares > BigInt(0) || noShares > BigInt(0);
  const statusColors: Record<string,string> = { open:"var(--up)", expired:"var(--warn)", resolved:"var(--accent-2)", paused:"var(--down)", invalid:"var(--faint)" };

  const RightPanel = () => (
    <>
      {isOpen && feeBps !== undefined && (
        <div style={{ marginBottom:16 }}>
          <TradePanel marketAddress={marketAddress} probability={probability} feeBps={feeBps} onSuccess={refetch}/>
        </div>
      )}
      {showClaim && (
        <ClaimPanel marketAddress={marketAddress} marketInfo={marketInfo} yesShares={yesShares} noShares={noShares} hasClaimed={hasClaimed} expectedPayout={expectedPayout} onSuccess={refetch}/>
      )}
      {!isOpen && !showClaim && (
        <div style={{ padding:20, borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.08)", textAlign:"center" }}>
          <p style={{ color:"var(--faint)", fontSize:14 }}>Market is {status}</p>
        </div>
      )}
    </>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px 48px", boxSizing:"border-box" as const }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .detail-grid{display:grid;grid-template-columns:1fr 360px;gap:20px;align-items:start}
        .mobile-panel{display:none}
        @media(max-width:768px){
          .detail-grid{grid-template-columns:1fr!important}
          .desktop-panel{display:none!important}
          .mobile-panel{display:block!important}
        }
      `}</style>

      <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--faint)", textDecoration:"none", fontSize:14, marginBottom:20 }}>
        <ArrowLeft size={16}/>All Markets
      </Link>

      {/* Header */}
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" as const, marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" as const }}>
            <span style={{ padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:`${statusColors[status]}20`, color:statusColors[status], border:`1px solid ${statusColors[status]}40` }}>
              {status.toUpperCase()}
            </span>
            {status==="resolved" && (
              <span style={{ padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:"rgba(var(--accent2-rgb),0.15)", color:"var(--accent-2)", border:"1px solid rgba(var(--accent2-rgb),0.3)" }}>
                {outcomeLabel(marketInfo.outcome)}
              </span>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <ShareButtons question={marketInfo.question} yes={yesPct}/>
            <a href={`https://sepolia.etherscan.io/address/${marketAddress}`} target="_blank" rel="noopener noreferrer" style={{ color:"var(--faint)", display:"flex" }}>
              <ExternalLink size={15}/>
            </a>
          </div>
        </div>
        <h1 style={{ color:"var(--text)", fontSize:"clamp(16px,3vw,22px)", fontWeight:800, lineHeight:1.3, marginBottom:14 }}>
          {marketInfo.question}
        </h1>
        <div style={{ display:"flex", flexWrap:"wrap" as const, gap:16, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <TrendingUp size={14} color="var(--accent)"/>
            <span style={{ color:"var(--text)", fontWeight:700, fontFamily:"var(--font-mono)" }}>{formatETH(marketInfo.totalPool)}</span>
            <span style={{ color:"var(--faint)", fontSize:13 }}>pool</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Clock size={14} color="var(--warn)"/>
            <span style={{ color:"var(--muted)", fontSize:13 }}>
              {status==="resolved" ? `Resolved ${formatTimestamp(marketInfo.resolutionTime)}` : formatTimeLeft(marketInfo.expirationTime)}
            </span>
          </div>
          <span style={{ color:"var(--faint-2)", fontSize:12, fontFamily:"var(--font-mono)" }}>{shortenAddress(marketAddress)}</span>
        </div>
      </div>

      {/* Mobile: trade panel above content */}
      <div className="mobile-panel" style={{ marginBottom:16 }}>
        <RightPanel/>
      </div>

      {/* Desktop grid */}
      <div className="detail-grid">
        {/* Left column */}
        <div>
          <div style={card}>
            <h3 style={{ color:"var(--text)", fontWeight:700, marginBottom:16, fontSize:14 }}>Current Probability</h3>
            <ProbBar yes={yesPct} no={noPct}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
              <div style={{ padding:14, borderRadius:12, background:"rgba(var(--up-rgb),0.1)", border:"1px solid rgba(var(--up-rgb),0.2)", textAlign:"center" }}>
                <div style={{ fontSize:26, fontWeight:900, fontFamily:"var(--font-mono)", color:"var(--up)" }}>{yesPct.toFixed(1)}%</div>
                <div style={{ color:"var(--faint)", fontSize:12, marginTop:4 }}>YES Probability</div>
              </div>
              <div style={{ padding:14, borderRadius:12, background:"rgba(var(--down-rgb),0.1)", border:"1px solid rgba(var(--down-rgb),0.2)", textAlign:"center" }}>
                <div style={{ fontSize:26, fontWeight:900, fontFamily:"var(--font-mono)", color:"var(--down)" }}>{noPct.toFixed(1)}%</div>
                <div style={{ color:"var(--faint)", fontSize:12, marginTop:4 }}>NO Probability</div>
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ color:"var(--text)", fontWeight:700, marginBottom:14, fontSize:14 }}>Pool Breakdown</h3>
            {[
              { label:"YES Pool", val:marketInfo.totalYesShares, color:"var(--up)" },
              { label:"NO Pool", val:marketInfo.totalNoShares, color:"var(--down)" },
              { label:"Total Pool", val:marketInfo.totalPool, color:"var(--accent)", bold:true },
            ].map(r=>(
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:r.bold?"8px 0 0":"4px 0", borderTop:r.bold?"1px solid rgba(var(--fg-rgb),0.06)":"none", marginTop:r.bold?8:0 }}>
                <span style={{ color:"var(--muted)", fontSize:13 }}>{r.label}</span>
                <span style={{ color:r.color, fontFamily:"var(--font-mono)", fontWeight:r.bold?700:500 }}>{formatETH(r.val)}</span>
              </div>
            ))}
          </div>

          {hasPosition && (
            <div style={card}>
              <h3 style={{ color:"var(--text)", fontWeight:700, marginBottom:14, fontSize:14 }}>Your Position</h3>
              {yesShares > BigInt(0) && (
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
                  <span style={{ color:"var(--muted)", fontSize:13 }}>YES Shares</span>
                  <span style={{ color:"var(--up)", fontFamily:"var(--font-mono)" }}>{formatETH(yesShares)}</span>
                </div>
              )}
              {noShares > BigInt(0) && (
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
                  <span style={{ color:"var(--muted)", fontSize:13 }}>NO Shares</span>
                  <span style={{ color:"var(--down)", fontFamily:"var(--font-mono)" }}>{formatETH(noShares)}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(var(--fg-rgb),0.06)", paddingTop:8, marginTop:8 }}>
                <span style={{ color:"var(--muted)", fontSize:13 }}>Expected Payout</span>
                <span style={{ color:"var(--accent)", fontFamily:"var(--font-mono)", fontWeight:700 }}>{formatETH(expectedPayout)}</span>
              </div>
            </div>
          )}

          <div style={card}>
            <h3 style={{ color:"var(--text)", fontWeight:700, marginBottom:14, fontSize:14 }}>Market Info</h3>
            {[
              { k:"Contract", v:shortenAddress(marketAddress) },
              { k:"Expires", v:formatTimestamp(marketInfo.expirationTime) },
              { k:"Fee", v:`${feeBps !== undefined ? Number(feeBps)/100 : 2}%` },
              { k:"Status", v:status.charAt(0).toUpperCase()+status.slice(1) },
            ].map(r=>(
              <div key={r.k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:13, fontFamily:"var(--font-mono)" }}>
                <span style={{ color:"var(--faint)" }}>{r.k}</span>
                <span style={{ color:"var(--muted)" }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - desktop only */}
        <div className="desktop-panel" style={{ position:"sticky", top:80 }}>
          <RightPanel/>
        </div>
      </div>
    </div>
  );
}