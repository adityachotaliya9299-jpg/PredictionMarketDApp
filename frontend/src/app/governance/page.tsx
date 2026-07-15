"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useAllProposals, useCreateProposal, useCastVote, useStakeInfo } from "@/hooks/useGovernance";
import { shortenAddress, formatTimestamp } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, Plus, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const STATE_LABELS = ["Active","Passed","Failed","Executed","Cancelled"];
const STATE_COLORS = ["var(--accent)","var(--up)","var(--down)","var(--accent-2)","var(--faint)"];
const STATE_BG = ["rgba(var(--accent-rgb),0.1)","rgba(var(--up-rgb),0.1)","rgba(var(--down-rgb),0.1)","rgba(var(--accent2-rgb),0.1)","rgba(var(--faint-rgb),0.1)"];

function ProposalCard({ proposal, userAddress }: { proposal: any; userAddress?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const { castVote, isPending, isConfirming, isSuccess } = useCastVote();

  const totalVotes = BigInt(proposal.forVotes) + BigInt(proposal.againstVotes);
  const forPct = totalVotes > BigInt(0) ? Number(BigInt(proposal.forVotes) * BigInt(100) / totalVotes) : 50;
  const againstPct = 100 - forPct;
  const state = proposal.state;
  const isActive = state === 0;
  const endTime = Number(proposal.endTime);
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = endTime - now;

  return (
    <div style={{ background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, overflow:"hidden", marginBottom:12 }}>
      <div style={{ padding:"16px 20px", cursor:"pointer" }} onClick={()=>setExpanded(!expanded)}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" as const }}>
              <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:STATE_BG[state], color:STATE_COLORS[state], border:`1px solid ${STATE_COLORS[state]}30` }}>
                {STATE_LABELS[state]}
              </span>
              <span style={{ color:"var(--faint-2)", fontSize:11 }}>#{proposal.id}</span>
              {isActive&&timeLeft>0&&(
                <span style={{ color:"var(--warn)", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
                  <Clock size={11}/>Ends {new Date(endTime*1000).toLocaleDateString()}
                </span>
              )}
            </div>
            <h3 style={{ color:"var(--text)", fontWeight:700, fontSize:15, margin:"0 0 4px" }}>{proposal.title}</h3>
            <p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>by {shortenAddress(proposal.proposer)}</p>
          </div>
          {expanded?<ChevronUp size={16} color="var(--faint)"/>:<ChevronDown size={16} color="var(--faint)"/>}
        </div>

        {/* Vote bar */}
        <div style={{ marginTop:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
            <span style={{ color:"var(--up)", fontFamily:"var(--font-mono)" }}>FOR {forPct}% ({Number(formatEther(BigInt(proposal.forVotes))).toFixed(0)} PRED)</span>
            <span style={{ color:"var(--down)", fontFamily:"var(--font-mono)" }}>AGAINST {againstPct}% ({Number(formatEther(BigInt(proposal.againstVotes))).toFixed(0)} PRED)</span>
          </div>
          <div style={{ height:6, borderRadius:99, background:"rgba(var(--down-rgb),0.2)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${forPct}%`, background:"linear-gradient(90deg,var(--up),var(--accent))", borderRadius:99, transition:"width 0.5s" }}/>
          </div>
        </div>
      </div>

      {expanded&&(
        <div style={{ padding:"0 20px 20px", borderTop:"1px solid rgba(var(--fg-rgb),0.04)" }}>
          <p style={{ color:"var(--muted)", fontSize:13, lineHeight:1.7, margin:"16px 0" }}>{proposal.description}</p>
          {isActive&&userAddress&&(
            <div>
              {error&&<div style={{ color:"var(--down)", fontSize:12, marginBottom:8, padding:"7px 12px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8 }}>{error}</div>}
              {isSuccess?(
                <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(var(--up-rgb),0.15)", color:"var(--up)", textAlign:"center", fontWeight:600 }}>✅ Vote cast!</div>
              ):(
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <button onClick={async()=>{try{await castVote(BigInt(proposal.id),true);}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                    disabled={isPending||isConfirming}
                    style={{ padding:"11px", borderRadius:10, background:"rgba(var(--up-rgb),0.15)", border:"1px solid rgba(var(--up-rgb),0.3)", color:"var(--up)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <CheckCircle size={15}/>Vote FOR
                  </button>
                  <button onClick={async()=>{try{await castVote(BigInt(proposal.id),false);}catch(e:any){setError(e?.shortMessage||"Failed");}}}
                    disabled={isPending||isConfirming}
                    style={{ padding:"11px", borderRadius:10, background:"rgba(var(--down-rgb),0.1)", border:"1px solid rgba(var(--down-rgb),0.3)", color:"var(--down)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <XCircle size={15}/>Vote AGAINST
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const { data: proposals, isLoading, refetch } = useAllProposals();
  const stakeInfo = useStakeInfo(address);
  const { propose, isPending, isConfirming, isSuccess } = useCreateProposal();

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const allProposals = (proposals as any[] | undefined) ?? [];
  const canPropose = stakeInfo.staked >= BigInt(100) * BigInt(1e18);

  const handlePropose = async () => {
    if (!title.trim()) { setError("Title required"); return; }
    if (!description.trim()) { setError("Description required"); return; }
    setError("");
    try {
      await propose(title.trim(), description.trim());
      setTitle(""); setDescription(""); setShowCreate(false);
      refetch();
    } catch(e: any) { setError(e?.shortMessage || "Failed"); }
  };

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 16px 64px", boxSizing:"border-box" as const }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      <div style={{ marginBottom:32 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(var(--accent3-rgb),0.08)", border:"1px solid rgba(var(--accent3-rgb),0.2)", color:"var(--accent-3)", fontSize:12, fontWeight:600, marginBottom:14 }}>
          🏛️ Governance
        </div>
        <h1 style={{ color:"var(--text)", fontSize:28, fontWeight:900, margin:"0 0 6px" }}>Governance</h1>
        <p style={{ color:"var(--faint)", fontSize:14, margin:0 }}>Vote on protocol proposals using your staked PRED</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
        {[
          { label:"Total Proposals", value:String(allProposals.length), color:"var(--accent)" },
          { label:"Active", value:String(allProposals.filter((p:any)=>p.state===0).length), color:"var(--up)" },
          { label:"Your Voting Power", value:`${stakeInfo.stakedFmt} PRED`, color:"var(--accent-3)" },
          { label:"Can Propose", value:canPropose?"Yes":"Need 100 PRED", color:canPropose?"var(--up)":"var(--down)" },
        ].map(s=>(
          <div key={s.label} style={{ padding:"14px 16px", borderRadius:14, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.07)" }}>
            <div style={{ color:"var(--faint)", fontSize:11, marginBottom:4 }}>{s.label}</div>
            <div style={{ color:s.color, fontWeight:800, fontSize:14, fontFamily:"var(--font-mono)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Create proposal */}
      {isConnected&&(
        <div style={{ marginBottom:24 }}>
          {!showCreate?(
            <button onClick={()=>setShowCreate(true)} disabled={!canPropose}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:12, background:canPropose?"linear-gradient(135deg,var(--accent-3),var(--accent-3))":"rgba(var(--fg-rgb),0.05)", border:"none", color:canPropose?"white":"var(--faint-2)", fontWeight:700, cursor:canPropose?"pointer":"not-allowed", fontSize:14 }}>
              <Plus size={16}/>{canPropose?"Create Proposal":"Stake 100+ PRED to Propose"}
            </button>
          ):(
            <div style={{ background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--accent3-rgb),0.25)", borderRadius:16, padding:20 }}>
              <h3 style={{ color:"var(--text)", fontWeight:700, marginBottom:16 }}>New Proposal</h3>
              <div style={{ marginBottom:12 }}>
                <label style={{ color:"var(--faint)", fontSize:12, display:"block", marginBottom:6 }}>Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Proposal title..." maxLength={100}
                  style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:10, padding:"10px 14px", color:"var(--text)", fontSize:14, outline:"none", boxSizing:"border-box" as const }}/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ color:"var(--faint)", fontSize:12, display:"block", marginBottom:6 }}>Description</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe what you want to change and why..." rows={4}
                  style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:10, padding:"10px 14px", color:"var(--text)", fontSize:14, outline:"none", resize:"none" as const, fontFamily:"inherit", lineHeight:1.6, boxSizing:"border-box" as const }}/>
              </div>
              {error&&<div style={{ color:"var(--down)", fontSize:12, marginBottom:10, padding:"7px 12px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8 }}>{error}</div>}
              {isSuccess?(
                <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(var(--up-rgb),0.15)", color:"var(--up)", textAlign:"center", fontWeight:600 }}>✅ Proposal created!</div>
              ):(
                <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10 }}>
                  <button onClick={()=>{setShowCreate(false);setError("");}} style={{ padding:12, borderRadius:10, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)", fontWeight:600, cursor:"pointer" }}>Cancel</button>
                  <button onClick={handlePropose} disabled={isPending||isConfirming||!title||!description}
                    style={{ padding:12, borderRadius:10, background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", border:"none", color:"var(--text)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    {isPending?"⏳ Confirm...":isConfirming?"⏳ Submitting...":"Submit Proposal"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Proposals list */}
      {isLoading?(
        <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
          {[1,2,3].map(i=><div key={i} style={{ height:100, borderRadius:16, background:"rgba(var(--fg-rgb),0.04)", animation:"pulse 2s infinite" }}/>)}
        </div>
      ):allProposals.length===0?(
        <div style={{ textAlign:"center", padding:"60px 24px", border:"1px dashed rgba(var(--fg-rgb),0.08)", borderRadius:20 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🏛️</div>
          <p style={{ color:"var(--faint)", fontSize:15, marginBottom:8 }}>No proposals yet</p>
          <p style={{ color:"var(--faint-2)", fontSize:13, marginBottom:24 }}>Stake 100+ PRED to create the first proposal</p>
          <Link href="/staking" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", borderRadius:12, color:"var(--text)", textDecoration:"none", fontSize:14, fontWeight:700 }}>
            Go to Staking →
          </Link>
        </div>
      ):(
        allProposals.map((p:any)=>(
          <ProposalCard key={p.id} proposal={p} userAddress={address}/>
        ))
      )}
    </div>
  );
}
