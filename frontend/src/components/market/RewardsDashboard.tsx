"use client";
import { useAccount } from "wagmi";
import { useUserRewardStats, useClaimPREDRewards, useClaimReferralEarnings } from "@/hooks/usePhase3";
import { useState } from "react";
import { formatEther } from "viem";

export function RewardsDashboard() {
  const { isConnected } = useAccount();
  const stats = useUserRewardStats();
  const { claim: claimPRED, isPending: predPending, isConfirming: predConfirming, isSuccess: predSuccess } = useClaimPREDRewards();
  const { claim: claimETH, isPending: ethPending, isConfirming: ethConfirming, isSuccess: ethSuccess } = useClaimReferralEarnings();
  const [error, setError] = useState("");

  if (!isConnected) return null;

  const hasPRED = stats.pendingPRED > BigInt(0);
  const hasETH = stats.pendingReferralETH > BigInt(0);

  return (
    <div style={{ marginBottom:32 }}>
      <h2 style={{ color:"var(--text)", fontSize:18, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
        <span>⚡</span> Rewards & Earnings
      </h2>

      {/* Live Prices */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:16 }}>
        {[
          { label:"ETH/USD", value:stats.ethPriceFmt, icon:"Ξ", color:"#627EEA" },
          { label:"BTC/USD", value:stats.btcPriceFmt, icon:"₿", color:"#F7931A" },
          { label:"PRED Balance", value:`${stats.predBalanceFmt} PRED`, icon:"🏆", color:"var(--accent)" },
          { label:"Referrals", value:String(stats.referralCount), icon:"👥", color:"var(--accent-3)" },
        ].map(s=>(
          <div key={s.label} style={{ padding:"14px 16px", borderRadius:14, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.08)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:18 }}>{s.icon}</span>
              <span style={{ color:"var(--faint)", fontSize:12 }}>{s.label}</span>
            </div>
            <div style={{ color:s.color, fontWeight:800, fontSize:16, fontFamily:"var(--font-mono)" }}>
              {stats.isLoading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Claimable rewards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {/* PRED Rewards */}
        <div style={{ padding:20, borderRadius:16, background: hasPRED?"rgba(var(--accent-rgb),0.08)":"rgba(var(--fg-rgb),0.03)", border:`1px solid ${hasPRED?"rgba(var(--accent-rgb),0.3)":"rgba(var(--fg-rgb),0.08)"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <p style={{ color:"var(--faint)", fontSize:12, margin:"0 0 4px" }}>Pending PRED Rewards</p>
              <p style={{ color: hasPRED?"var(--accent)":"var(--faint-2)", fontSize:22, fontWeight:900, fontFamily:"var(--font-mono)", margin:0 }}>
                {stats.predBalanceFmt === "0.00" && !hasPRED ? "0" : Number(formatEther(stats.pendingPRED)).toFixed(1)} PRED
              </p>
            </div>
            <span style={{ fontSize:28 }}>🏅</span>
          </div>
          <p style={{ color:"var(--faint-2)", fontSize:11, margin:"0 0 12px" }}>
            Earned from creating markets and trading. Total claimed: {Number(formatEther(stats.totalClaimedPRED)).toFixed(1)} PRED
          </p>
          {predSuccess ? (
            <div style={{ padding:"8px 12px", borderRadius:8, background:"rgba(var(--up-rgb),0.15)", color:"var(--up)", fontSize:13, textAlign:"center" }}>✅ Claimed!</div>
          ) : (
            <button onClick={async()=>{try{await claimPRED();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
              disabled={!hasPRED||predPending||predConfirming}
              style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:hasPRED?"linear-gradient(135deg,var(--accent),var(--accent-2))":"rgba(var(--fg-rgb),0.05)", color:hasPRED?"black":"var(--faint-2)", fontWeight:700, fontSize:13, cursor:hasPRED?"pointer":"not-allowed" }}>
              {predPending?"⏳ Confirm...":predConfirming?"⏳ Claiming...":hasPRED?"Claim PRED Rewards":"No Rewards Yet"}
            </button>
          )}
        </div>

        {/* Referral Earnings */}
        <div style={{ padding:20, borderRadius:16, background: hasETH?"rgba(var(--accent3-rgb),0.08)":"rgba(var(--fg-rgb),0.03)", border:`1px solid ${hasETH?"rgba(var(--accent3-rgb),0.3)":"rgba(var(--fg-rgb),0.08)"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <p style={{ color:"var(--faint)", fontSize:12, margin:"0 0 4px" }}>Referral Earnings (ETH)</p>
              <p style={{ color: hasETH?"var(--accent-3)":"var(--faint-2)", fontSize:22, fontWeight:900, fontFamily:"var(--font-mono)", margin:0 }}>
                {Number(formatEther(stats.pendingReferralETH)).toFixed(4)} ETH
              </p>
            </div>
            <span style={{ fontSize:28 }}>🔗</span>
          </div>
          <p style={{ color:"var(--faint-2)", fontSize:11, margin:"0 0 12px" }}>
            {stats.referralCount.toString()} trader{stats.referralCount !== BigInt(1)?"s":""} referred. Earn 0.5% of every trade they make.
          </p>
          {ethSuccess ? (
            <div style={{ padding:"8px 12px", borderRadius:8, background:"rgba(var(--up-rgb),0.15)", color:"var(--up)", fontSize:13, textAlign:"center" }}>✅ Claimed!</div>
          ) : (
            <button onClick={async()=>{try{await claimETH();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
              disabled={!hasETH||ethPending||ethConfirming}
              style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:hasETH?"linear-gradient(135deg,var(--accent-3),var(--accent-3))":"rgba(var(--fg-rgb),0.05)", color:hasETH?"white":"var(--faint-2)", fontWeight:700, fontSize:13, cursor:hasETH?"pointer":"not-allowed" }}>
              {ethPending?"⏳ Confirm...":ethConfirming?"⏳ Claiming...":hasETH?"Claim ETH Earnings":"No Earnings Yet"}
            </button>
          )}
        </div>
      </div>

      {/* Referral link */}
      <div style={{ marginTop:12, padding:"14px 16px", borderRadius:14, background:"rgba(var(--accent3-rgb),0.06)", border:"1px solid rgba(var(--accent3-rgb),0.15)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <p style={{ color:"var(--text)", fontWeight:600, fontSize:14, margin:"0 0 2px" }}>🔗 Your Referral Link</p>
          <p style={{ color:"var(--faint)", fontSize:12, margin:0, fontFamily:"var(--font-mono)" }}>
            {typeof window !== "undefined" ? `${window.location.origin}?ref=${stats.address?.slice(0,8)}` : "Connect wallet to get link"}
          </p>
        </div>
        <button onClick={()=>{
          if(stats.address) navigator.clipboard.writeText(`${window.location.origin}?ref=${stats.address}`);
        }} style={{ padding:"8px 16px", borderRadius:10, background:"rgba(var(--accent3-rgb),0.15)", border:"1px solid rgba(var(--accent3-rgb),0.3)", color:"var(--accent-3)", fontWeight:600, fontSize:13, cursor:"pointer" }}>
          Copy Link
        </button>
      </div>

      {error && <div style={{ color:"var(--down)", fontSize:13, marginTop:8, padding:"8px 12px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8 }}>{error}</div>}
    </div>
  );
}
