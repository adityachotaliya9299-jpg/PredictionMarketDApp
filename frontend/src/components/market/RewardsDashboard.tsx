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
      <h2 style={{ color:"white", fontSize:18, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
        <span>⚡</span> Rewards & Earnings
      </h2>

      {/* Live Prices */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:16 }}>
        {[
          { label:"ETH/USD", value:stats.ethPriceFmt, icon:"Ξ", color:"#627EEA" },
          { label:"BTC/USD", value:stats.btcPriceFmt, icon:"₿", color:"#F7931A" },
          { label:"PRED Balance", value:`${stats.predBalanceFmt} PRED`, icon:"🏆", color:"#22d3ee" },
          { label:"Referrals", value:String(stats.referralCount), icon:"👥", color:"#a855f7" },
        ].map(s=>(
          <div key={s.label} style={{ padding:"14px 16px", borderRadius:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:18 }}>{s.icon}</span>
              <span style={{ color:"#6b7280", fontSize:12 }}>{s.label}</span>
            </div>
            <div style={{ color:s.color, fontWeight:800, fontSize:16, fontFamily:"monospace" }}>
              {stats.isLoading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Claimable rewards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {/* PRED Rewards */}
        <div style={{ padding:20, borderRadius:16, background: hasPRED?"rgba(34,211,238,0.08)":"rgba(255,255,255,0.03)", border:`1px solid ${hasPRED?"rgba(34,211,238,0.3)":"rgba(255,255,255,0.08)"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <p style={{ color:"#6b7280", fontSize:12, margin:"0 0 4px" }}>Pending PRED Rewards</p>
              <p style={{ color: hasPRED?"#22d3ee":"#4b5563", fontSize:22, fontWeight:900, fontFamily:"monospace", margin:0 }}>
                {stats.predBalanceFmt === "0.00" && !hasPRED ? "0" : Number(formatEther(stats.pendingPRED)).toFixed(1)} PRED
              </p>
            </div>
            <span style={{ fontSize:28 }}>🏅</span>
          </div>
          <p style={{ color:"#4b5563", fontSize:11, margin:"0 0 12px" }}>
            Earned from creating markets and trading. Total claimed: {Number(formatEther(stats.totalClaimedPRED)).toFixed(1)} PRED
          </p>
          {predSuccess ? (
            <div style={{ padding:"8px 12px", borderRadius:8, background:"rgba(16,185,129,0.15)", color:"#10b981", fontSize:13, textAlign:"center" }}>✅ Claimed!</div>
          ) : (
            <button onClick={async()=>{try{await claimPRED();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
              disabled={!hasPRED||predPending||predConfirming}
              style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:hasPRED?"linear-gradient(135deg,#22d3ee,#3b82f6)":"rgba(255,255,255,0.05)", color:hasPRED?"black":"#4b5563", fontWeight:700, fontSize:13, cursor:hasPRED?"pointer":"not-allowed" }}>
              {predPending?"⏳ Confirm...":predConfirming?"⏳ Claiming...":hasPRED?"Claim PRED Rewards":"No Rewards Yet"}
            </button>
          )}
        </div>

        {/* Referral Earnings */}
        <div style={{ padding:20, borderRadius:16, background: hasETH?"rgba(168,85,247,0.08)":"rgba(255,255,255,0.03)", border:`1px solid ${hasETH?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.08)"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <p style={{ color:"#6b7280", fontSize:12, margin:"0 0 4px" }}>Referral Earnings (ETH)</p>
              <p style={{ color: hasETH?"#a855f7":"#4b5563", fontSize:22, fontWeight:900, fontFamily:"monospace", margin:0 }}>
                {Number(formatEther(stats.pendingReferralETH)).toFixed(4)} ETH
              </p>
            </div>
            <span style={{ fontSize:28 }}>🔗</span>
          </div>
          <p style={{ color:"#4b5563", fontSize:11, margin:"0 0 12px" }}>
            {stats.referralCount.toString()} trader{stats.referralCount !== BigInt(1)?"s":""} referred. Earn 0.5% of every trade they make.
          </p>
          {ethSuccess ? (
            <div style={{ padding:"8px 12px", borderRadius:8, background:"rgba(16,185,129,0.15)", color:"#10b981", fontSize:13, textAlign:"center" }}>✅ Claimed!</div>
          ) : (
            <button onClick={async()=>{try{await claimETH();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
              disabled={!hasETH||ethPending||ethConfirming}
              style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:hasETH?"linear-gradient(135deg,#a855f7,#7c3aed)":"rgba(255,255,255,0.05)", color:hasETH?"white":"#4b5563", fontWeight:700, fontSize:13, cursor:hasETH?"pointer":"not-allowed" }}>
              {ethPending?"⏳ Confirm...":ethConfirming?"⏳ Claiming...":hasETH?"Claim ETH Earnings":"No Earnings Yet"}
            </button>
          )}
        </div>
      </div>

      {/* Referral link */}
      <div style={{ marginTop:12, padding:"14px 16px", borderRadius:14, background:"rgba(168,85,247,0.06)", border:"1px solid rgba(168,85,247,0.15)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <p style={{ color:"white", fontWeight:600, fontSize:14, margin:"0 0 2px" }}>🔗 Your Referral Link</p>
          <p style={{ color:"#6b7280", fontSize:12, margin:0, fontFamily:"monospace" }}>
            {typeof window !== "undefined" ? `${window.location.origin}?ref=${stats.address?.slice(0,8)}` : "Connect wallet to get link"}
          </p>
        </div>
        <button onClick={()=>{
          if(stats.address) navigator.clipboard.writeText(`${window.location.origin}?ref=${stats.address}`);
        }} style={{ padding:"8px 16px", borderRadius:10, background:"rgba(168,85,247,0.15)", border:"1px solid rgba(168,85,247,0.3)", color:"#a855f7", fontWeight:600, fontSize:13, cursor:"pointer" }}>
          Copy Link
        </button>
      </div>

      {error && <div style={{ color:"#ef4444", fontSize:13, marginTop:8, padding:"8px 12px", background:"rgba(239,68,68,0.1)", borderRadius:8 }}>{error}</div>}
    </div>
  );
}
