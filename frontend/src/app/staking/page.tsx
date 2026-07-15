"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useStakeInfo, useTotalStaked, useStakePRED, useUnstakePRED, useClaimStakingReward, useApprovePRED, usePREDAllowance, useFaucetClaimed, useFaucetBalance, useClaimFaucet } from "@/hooks/useGovernance";
import { usePREDBalance } from "@/hooks/usePhase3";
import { Zap, TrendingUp, Lock, Unlock, Gift, Info } from "lucide-react";
import Link from "next/link";
import { parseEther } from "viem";

const card = { background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.08)", borderRadius:16, padding:20 };

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const stakeInfo = useStakeInfo(address);
  const { data: totalStaked } = useTotalStaked();
  const { data: predBalance } = usePREDBalance(address);
  const { data: allowance, refetch: refetchAllowance } = usePREDAllowance(address);

  const { stake, isPending: stakePending, isConfirming: stakeConfirming, isSuccess: stakeSuccess, isError: stakeError, error: stakeErrorObj } = useStakePRED();
  const { unstake, isPending: unstakePending, isConfirming: unstakeConfirming, isSuccess: unstakeSuccess } = useUnstakePRED();
  const { claim, isPending: claimPending, isConfirming: claimConfirming, isSuccess: claimSuccess } = useClaimStakingReward();
  const { approve, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveSuccess } = useApprovePRED();

  const { data: hasClaimed } = useFaucetClaimed(address);
  const { data: faucetBal } = useFaucetBalance();
  const { claim: claimFaucet, isPending: faucetPending, isConfirming: faucetConfirming, isSuccess: faucetSuccess } = useClaimFaucet();
  const [faucetError, setFaucetError] = useState("");

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"stake"|"unstake">("stake");

  const parsedStakeAmount = (() => {
    try { return stakeAmount ? parseEther(stakeAmount as `${number}`) : BigInt(0); }
    catch { return BigInt(0); }
  })();
  const needsApproval = parsedStakeAmount > BigInt(0) &&
    !approveSuccess &&
    ((allowance === undefined) || ((allowance as bigint) < parsedStakeAmount));

  // Show tx receipt error
  const stakeErrorMsg = stakeErrorObj ? (stakeErrorObj as any)?.shortMessage || (stakeErrorObj as any)?.message || "Transaction failed" : "";

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) { setError("Enter amount"); return; }
    setError("");
    try {
      await stake(stakeAmount);
      setStakeAmount("");
      setTimeout(() => { stakeInfo.refetch(); refetchAllowance(); }, 3000);
    } catch(e: any) { setError(e?.shortMessage || "Failed"); }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) { setError("Enter amount"); return; }
    setError("");
    try {
      await unstake(unstakeAmount);
      setUnstakeAmount("");
      stakeInfo.refetch();
    } catch(e: any) { setError(e?.shortMessage || "Failed"); }
  };

  const handleApprove = async () => {
    setError("");
    try {
      await approve(stakeAmount || "1000000");
      setTimeout(() => refetchAllowance(), 2000);
    } catch(e: any) { setError(e?.shortMessage || "Failed"); }
  };

  if (!isConnected) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ color:"var(--text)", fontWeight:700, marginBottom:8 }}>Connect Wallet</h2>
        <p style={{ color:"var(--faint)", fontSize:14 }}>Connect to stake PRED and earn protocol fees</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 16px 64px", boxSizing:"border-box" as const }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(var(--accent-rgb),0.08)", border:"1px solid rgba(var(--accent-rgb),0.2)", color:"var(--accent)", fontSize:12, fontWeight:600, marginBottom:14 }}>
          <Zap size={11}/>PRED Staking
        </div>
        <h1 style={{ color:"var(--text)", fontSize:28, fontWeight:900, margin:"0 0 6px" }}>Stake PRED</h1>
        <p style={{ color:"var(--faint)", fontSize:14, margin:0 }}>Stake PRED tokens to earn a share of protocol fees in ETH</p>
      </div>

      {/* Faucet Banner */}
      {!hasClaimed && (
        <div style={{ marginBottom:20, padding:"16px 20px", borderRadius:16, background:"linear-gradient(135deg,rgba(var(--accent-rgb),0.08),rgba(var(--accent3-rgb),0.08))", border:"1px solid rgba(var(--accent-rgb),0.2)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" as const }}>
          <div>
            <p style={{ color:"var(--text)", fontWeight:700, fontSize:15, margin:"0 0 4px" }}>🎁 New User? Claim 100 FREE PRED</p>
            <p style={{ color:"var(--faint)", fontSize:13, margin:0 }}>
              Get 100 PRED to start staking and voting. One-time claim per wallet.
              {faucetBal ? ` (${Number(faucetBal as bigint) / 1e18} PRED remaining in faucet)` : ""}
            </p>
            {faucetError && <p style={{ color:"var(--down)", fontSize:12, marginTop:4 }}>{faucetError}</p>}
          </div>
          {faucetSuccess ? (
            <div style={{ padding:"10px 20px", borderRadius:10, background:"rgba(var(--up-rgb),0.15)", color:"var(--up)", fontWeight:700, whiteSpace:"nowrap" as const }}>✅ 100 PRED Claimed!</div>
          ) : (
            <button onClick={async()=>{try{await claimFaucet();}catch(e:any){setFaucetError(e?.shortMessage||"Failed");}}}
              disabled={faucetPending||faucetConfirming}
              style={{ padding:"12px 24px", borderRadius:12, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", border:"none", color:"var(--on-accent)", fontWeight:700, fontSize:14, cursor:"pointer", whiteSpace:"nowrap" as const }}>
              {faucetPending?"⏳ Confirm...":faucetConfirming?"⏳ Claiming...":"🎁 Claim 100 PRED"}
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:28 }}>
        {[
          { label:"Your Staked", value:`${stakeInfo.stakedFmt} PRED`, color:"var(--accent)", icon:"🔒" },
          { label:"Your Pool Share", value:`${stakeInfo.sharePct}%`, color:"var(--accent-3)", icon:"📊" },
          { label:"Pending ETH Reward", value:`${stakeInfo.rewardFmt} ETH`, color:"var(--up)", icon:"💰" },
          { label:"Total Staked", value:totalStaked?`${Number(formatEther(totalStaked as bigint)).toFixed(0)} PRED`:"—", color:"var(--warn)", icon:"🌐" },
          { label:"PRED Balance", value:`${predBalance?Number(formatEther(predBalance as bigint)).toFixed(2):"0"} PRED`, color:"#f97316", icon:"🏆" },
        ].map(s=>(
          <div key={s.label} style={{ padding:"14px 16px", borderRadius:14, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.07)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <span style={{ fontSize:16 }}>{s.icon}</span>
              <span style={{ color:"var(--faint)", fontSize:11 }}>{s.label}</span>
            </div>
            <div style={{ color:s.color, fontWeight:800, fontSize:15, fontFamily:"var(--font-mono)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
        {/* Stake/Unstake panel */}
        <div style={card}>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, background:"rgba(var(--fg-rgb),0.04)", borderRadius:10, padding:4, marginBottom:20 }}>
            {(["stake","unstake"] as const).map(t=>(
              <button key={t} onClick={()=>{setTab(t);setError("");}}
                style={{ flex:1, padding:"8px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.2s",
                  background:tab===t?"rgba(var(--accent-rgb),0.15)":"transparent",
                  color:tab===t?"var(--accent)":"var(--faint)" }}>
                {t==="stake"?"🔒 Stake":"🔓 Unstake"}
              </button>
            ))}
          </div>

          {tab==="stake"&&(
            <>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:"var(--muted)", fontSize:12 }}>Amount (PRED)</span>
                  <span style={{ color:"var(--faint)", fontSize:12 }}>
                    Bal: {predBalance?Number(formatEther(predBalance as bigint)).toFixed(2):"0"} PRED
                  </span>
                </div>
                <div style={{ position:"relative" }}>
                  <input type="number" value={stakeAmount} onChange={e=>{setStakeAmount(e.target.value);setError("");}} placeholder="0.0" min="1"
                    style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:10, padding:"11px 60px 11px 14px", color:"var(--text)", fontSize:15, fontFamily:"var(--font-mono)", outline:"none", boxSizing:"border-box" as const }}/>
                  <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"var(--faint)", fontSize:13 }}>PRED</span>
                </div>
                <div style={{ display:"flex", gap:6, marginTop:8 }}>
                  {["100","500","1000","5000"].map(q=>(
                    <button key={q} onClick={()=>setStakeAmount(q)} style={{ flex:1, padding:"5px 0", borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", cursor:"pointer", border:stakeAmount===q?"1px solid rgba(var(--accent-rgb),0.4)":"1px solid rgba(var(--fg-rgb),0.06)", background:stakeAmount===q?"rgba(var(--accent-rgb),0.1)":"transparent", color:stakeAmount===q?"var(--accent)":"var(--faint)" }}>{q}</button>
                  ))}
                </div>
              </div>
              {(error || stakeErrorMsg) && <div style={{ color:"var(--down)", fontSize:12, marginBottom:10, padding:"8px 12px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8 }}>{error || stakeErrorMsg}</div>}
              {needsApproval?(
                <button onClick={handleApprove} disabled={approvePending||approveConfirming}
                  style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--warn),#f97316)", border:"none", color:"var(--on-accent)", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {approvePending||approveConfirming?"⏳ Approving...":"✅ Approve PRED"}
                </button>
              ):(
                <button onClick={handleStake} disabled={stakePending||stakeConfirming||!stakeAmount}
                  style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", border:"none", color:"var(--on-accent)", fontWeight:700, fontSize:14, cursor:!stakeAmount?"not-allowed":"pointer", opacity:!stakeAmount?0.5:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <Lock size={15}/>{stakePending?"⏳ Confirm...":stakeConfirming?"⏳ Staking...":stakeSuccess?"✅ Staked!":"Stake PRED"}
                </button>
              )}
              <p style={{ color:"var(--faint-2)", fontSize:11, textAlign:"center", marginTop:8 }}>Minimum stake: 1 PRED</p>
            </>
          )}

          {tab==="unstake"&&(
            <>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:"var(--muted)", fontSize:12 }}>Amount (PRED)</span>
                  <span style={{ color:"var(--faint)", fontSize:12 }}>Staked: {stakeInfo.stakedFmt} PRED</span>
                </div>
                <div style={{ position:"relative" }}>
                  <input type="number" value={unstakeAmount} onChange={e=>{setUnstakeAmount(e.target.value);setError("");}} placeholder="0.0"
                    style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:10, padding:"11px 60px 11px 14px", color:"var(--text)", fontSize:15, fontFamily:"var(--font-mono)", outline:"none", boxSizing:"border-box" as const }}/>
                  <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"var(--faint)", fontSize:13 }}>PRED</span>
                </div>
                <button onClick={()=>setUnstakeAmount(stakeInfo.stakedFmt)} style={{ marginTop:8, padding:"4px 10px", borderRadius:8, fontSize:11, cursor:"pointer", border:"1px solid rgba(var(--fg-rgb),0.06)", background:"transparent", color:"var(--faint)" }}>Max</button>
              </div>
              {(error || stakeErrorMsg) && <div style={{ color:"var(--down)", fontSize:12, marginBottom:10, padding:"8px 12px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8 }}>{error || stakeErrorMsg}</div>}
              <button onClick={handleUnstake} disabled={unstakePending||unstakeConfirming||!unstakeAmount}
                style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", border:"none", color:"var(--text)", fontWeight:700, fontSize:14, cursor:!unstakeAmount?"not-allowed":"pointer", opacity:!unstakeAmount?0.5:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <Unlock size={15}/>{unstakePending?"⏳ Confirm...":unstakeConfirming?"⏳ Unstaking...":unstakeSuccess?"✅ Unstaked!":"Unstake PRED"}
              </button>
            </>
          )}
        </div>

        {/* Rewards + Info panel */}
        <div style={{ display:"flex", flexDirection:"column" as const, gap:16 }}>
          {/* Claim ETH rewards */}
          <div style={{ ...card, background:stakeInfo.pendingReward>BigInt(0)?"rgba(var(--up-rgb),0.06)":"rgba(var(--fg-rgb),0.03)", border:`1px solid ${stakeInfo.pendingReward>BigInt(0)?"rgba(var(--up-rgb),0.25)":"rgba(var(--fg-rgb),0.07)"}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <p style={{ color:"var(--faint)", fontSize:12, margin:"0 0 6px" }}>Pending ETH Rewards</p>
                <p style={{ color:stakeInfo.pendingReward>BigInt(0)?"var(--up)":"var(--faint-2)", fontSize:22, fontWeight:900, fontFamily:"var(--font-mono)", margin:0 }}>
                  {stakeInfo.rewardFmt} ETH
                </p>
              </div>
              <span style={{ fontSize:28 }}>💰</span>
            </div>
            <p style={{ color:"var(--faint-2)", fontSize:12, marginBottom:12, lineHeight:1.6 }}>
              Your share of protocol fees proportional to your staked PRED
            </p>
            {claimSuccess?(
              <div style={{ padding:"10px", borderRadius:10, background:"rgba(var(--up-rgb),0.15)", color:"var(--up)", textAlign:"center", fontWeight:600 }}>✅ Claimed!</div>
            ):(
              <button onClick={async()=>{try{await claim();stakeInfo.refetch();}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                disabled={claimPending||claimConfirming||stakeInfo.pendingReward<=BigInt(0)}
                style={{ width:"100%", padding:"11px", borderRadius:10, border:"none", fontWeight:700, fontSize:14, cursor:stakeInfo.pendingReward>BigInt(0)?"pointer":"not-allowed", background:stakeInfo.pendingReward>BigInt(0)?"linear-gradient(135deg,var(--up),var(--accent))":"rgba(var(--fg-rgb),0.05)", color:stakeInfo.pendingReward>BigInt(0)?"black":"var(--faint-2)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <Gift size={14}/>{claimPending?"⏳ Confirm...":claimConfirming?"⏳ Claiming...":stakeInfo.pendingReward>BigInt(0)?"Claim ETH Rewards":"No Rewards Yet"}
              </button>
            )}
          </div>

          {/* Info box */}
          <div style={{ ...card, background:"rgba(var(--accent-rgb),0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <Info size={15} color="var(--accent)"/>
              <span style={{ color:"var(--accent)", fontWeight:600, fontSize:14 }}>How Staking Works</span>
            </div>
            {[
              "Stake PRED tokens to earn ETH from protocol fees",
              "Rewards are proportional to your share of total staked PRED",
              "Protocol collects 2% fee on every trade",
              "Unstake anytime — no lock period",
              "Need 100+ PRED staked to create governance proposals",
            ].map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <span style={{ color:"var(--accent)", fontSize:12, flexShrink:0 }}>→</span>
                <span style={{ color:"var(--faint)", fontSize:12, lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Governance link */}
          <Link href="/governance" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderRadius:14, background:"rgba(var(--accent3-rgb),0.06)", border:"1px solid rgba(var(--accent3-rgb),0.2)", textDecoration:"none" }}>
            <div>
              <p style={{ color:"var(--text)", fontWeight:600, fontSize:14, margin:"0 0 2px" }}>🏛️ Governance</p>
              <p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>Vote on protocol proposals</p>
            </div>
            <span style={{ color:"var(--accent-3)", fontSize:18 }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
