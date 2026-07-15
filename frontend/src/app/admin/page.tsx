"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useFactoryOwner, useFactoryFeeBps, useFactoryPaused, useAllMarkets } from "@/hooks/useMarket";
import { useFactoryAdmin, useSetOracleResolution } from "@/hooks/useTransactions";
import { useMultiMarkets, useResolveViaOracle } from "@/hooks/useMultiOutcome";
import { FACTORY_ADDRESS, ORACLE_ADDRESS, MULTI_FACTORY_ADDRESS, MULTI_ORACLE_ADDRESS } from "@/lib/contracts";
import { formatETH, shortenAddress } from "@/lib/utils";
import type { MarketMetadata } from "@/types/market";
import { Shield, Settings, Pause, Play, Sliders, EyeOff, CheckCircle, AlertTriangle, RefreshCw, Layers, ChevronDown, ChevronUp } from "lucide-react";

const OUTCOME_LABELS = ["UNRESOLVED", "YES", "NO", "INVALID"];

const card = { background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.07)", borderRadius:16, padding:20 };
const input = { background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:10, padding:"10px 14px", color:"var(--text)", fontSize:13, fontFamily:"var(--font-mono)", outline:"none", width:"100%", boxSizing:"border-box" as const };
const labelStyle = { color:"var(--faint-2)", fontSize:11, fontWeight:700 as const, textTransform:"uppercase" as const, letterSpacing:"0.08em", display:"block" as const, marginBottom:6 };

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding:"14px 16px", borderRadius:12, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.07)" }}>
      <div style={{ color:"var(--faint)", fontSize:11, marginBottom:4 }}>{label}</div>
      <div style={{ color:color||"white", fontWeight:700, fontSize:14, fontFamily:"var(--font-mono)" }}>{value}</div>
    </div>
  );
}

function ActionBtn({ label, color, onClick, disabled, icon }: any) {
  const c = { green:"var(--up)", red:"var(--down)", amber:"var(--warn)", blue:"var(--accent-2)", cyan:"var(--accent)" }[color as string] || "var(--accent)";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.4:1, border:`1px solid ${c}30`, background:`${c}12`, color:c, transition:"all 0.2s" }}>
      {icon}{label}
    </button>
  );
}

// ─── Multi-Outcome Market Row ──────────────────────────────────────────────────
function MultiMarketRow({ market }: { market: any }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { resolve, isPending, isConfirming, isSuccess } = useResolveViaOracle(market.marketId as `0x${string}`);

  const handleResolve = async () => {
    setError(""); setSuccess("");
    try {
      await resolve(selectedOutcome);
      setSuccess(`Resolved: ${market.outcomes[selectedOutcome]}`);
    } catch(e: any) { setError(e?.shortMessage || "Failed"); }
  };

  const expired = Math.floor(Date.now()/1000) >= Number(market.expirationTime);
  const status = expired ? "EXPIRED" : "LIVE";
  const statusColor = expired ? "var(--warn)" : "var(--up)";

  return (
    <div style={{ borderRadius:12, border:"1px solid rgba(var(--fg-rgb),0.06)", background:"rgba(0,0,0,0.2)", marginBottom:10, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, cursor:"pointer" }} onClick={()=>setExpanded(!expanded)}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:"var(--text)", fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const, margin:0 }}>{market.question}</p>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
            <span style={{ color:"var(--faint)", fontFamily:"var(--font-mono)", fontSize:11 }}>{shortenAddress(market.marketAddress)}</span>
            <span style={{ padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:700, background:`${statusColor}15`, color:statusColor, border:`1px solid ${statusColor}25` }}>{status}</span>
            <span style={{ color:"var(--faint)", fontSize:11 }}>{market.outcomes?.length} outcomes</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} color="var(--faint)"/> : <ChevronDown size={16} color="var(--faint)"/>}
      </div>

      {expanded && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid rgba(var(--fg-rgb),0.04)" }}>
          <div style={{ paddingTop:12 }}>
            <p style={{ ...labelStyle, marginBottom:10 }}>Outcomes</p>
            <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8, marginBottom:14 }}>
              {market.outcomes?.map((o: string, i: number) => (
                <span key={i} style={{ padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:600, background:"rgba(var(--accent3-rgb),0.1)", color:"var(--accent-3)", border:"1px solid rgba(var(--accent3-rgb),0.2)" }}>
                  {i}: {o}
                </span>
              ))}
            </div>
            <p style={labelStyle}>Resolve via MultiOracle</p>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <select value={selectedOutcome} onChange={e=>setSelectedOutcome(Number(e.target.value))}
                style={{ flex:1, ...input, padding:"8px 12px" }}>
                {market.outcomes?.map((o: string, i: number) => (
                  <option key={i} value={i} style={{ background:"var(--bg-2)" }}>{i}: {o}</option>
                ))}
                <option value={255} style={{ background:"var(--bg-2)" }}>255: INVALID</option>
              </select>
              <button onClick={handleResolve} disabled={isPending||isConfirming}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, fontSize:12, fontWeight:700, cursor:isPending||isConfirming?"wait":"pointer", border:"1px solid rgba(var(--accent2-rgb),0.3)", background:"rgba(var(--accent2-rgb),0.12)", color:"var(--accent-2)", whiteSpace:"nowrap" as const }}>
                <RefreshCw size={13}/>{isPending?"Confirm...":isConfirming?"Resolving...":"Set Oracle"}
              </button>
            </div>
            {success&&<div style={{ color:"var(--up)", fontSize:12, marginTop:8, padding:"7px 12px", background:"rgba(var(--up-rgb),0.1)", borderRadius:8 }}>✅ {success}</div>}
            {error&&<div style={{ color:"var(--down)", fontSize:12, marginTop:8, padding:"7px 12px", background:"rgba(var(--down-rgb),0.1)", borderRadius:8 }}>{error}</div>}
            <p style={{ color:"var(--faint-2)", fontSize:11, marginTop:8, lineHeight:1.5 }}>
              After setting oracle, anyone can call resolve() on the market contract once it expires.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── YES/NO Market Row ────────────────────────────────────────────────────────
function MarketRow({ m, onExec, isPending, resolvePending }: any) {
  const [expanded, setExpanded] = useState(false);
  const [outcome, setOutcome] = useState("1");
  const { setResolution } = useSetOracleResolution();

  return (
    <div style={{ borderRadius:12, border:"1px solid rgba(var(--fg-rgb),0.06)", background:"rgba(0,0,0,0.2)", marginBottom:10, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, cursor:"pointer" }} onClick={()=>setExpanded(!expanded)}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:"var(--text)", fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const, margin:0 }}>{m.question}</p>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
            <span style={{ color:"var(--faint)", fontFamily:"var(--font-mono)", fontSize:11 }}>{shortenAddress(m.marketAddress)}</span>
            <span style={{ padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:700, background:m.active?"rgba(var(--up-rgb),0.1)":"rgba(var(--faint-rgb),0.1)", color:m.active?"var(--up)":"var(--faint)", border:`1px solid ${m.active?"rgba(var(--up-rgb),0.2)":"rgba(var(--faint-rgb),0.2)"}` }}>
              {m.active?"Active":"Inactive"}
            </span>
          </div>
        </div>
        {expanded?<ChevronUp size={16} color="var(--faint)"/>:<ChevronDown size={16} color="var(--faint)"/>}
      </div>

      {expanded&&(
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid rgba(var(--fg-rgb),0.04)" }}>
          <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8, paddingTop:12, marginBottom:14 }}>
            <ActionBtn label="Pause" color="amber" icon={<Pause size={12}/>} disabled={isPending} onClick={()=>onExec(()=>m.pauseMarket(m.marketId),"Market paused")}/>
            <ActionBtn label="Unpause" color="green" icon={<Play size={12}/>} disabled={isPending} onClick={()=>onExec(()=>m.unpauseMarket(m.marketId),"Market unpaused")}/>
            <ActionBtn label="Deactivate" color="red" icon={<EyeOff size={12}/>} disabled={isPending||!m.active} onClick={()=>onExec(()=>m.deactivateMarket(m.marketId),"Market deactivated")}/>
          </div>
          <p style={labelStyle}>Set Oracle Resolution (YES/NO Market)</p>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <select value={outcome} onChange={e=>setOutcome(e.target.value)} style={{ flex:1, ...input, padding:"8px 12px" }}>
              <option value="1" style={{ background:"var(--bg-2)" }}>YES</option>
              <option value="2" style={{ background:"var(--bg-2)" }}>NO</option>
              <option value="3" style={{ background:"var(--bg-2)" }}>INVALID</option>
            </select>
            <button onClick={()=>onExec(()=>setResolution(m.marketId,parseInt(outcome)),`Oracle resolved: ${OUTCOME_LABELS[parseInt(outcome)]}`)}
              disabled={resolvePending}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", border:"1px solid rgba(var(--accent-rgb),0.3)", background:"rgba(var(--accent-rgb),0.1)", color:"var(--accent)", whiteSpace:"nowrap" as const }}>
              <RefreshCw size={13}/>Resolve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { data: owner } = useFactoryOwner();
  const { data: feeBps, refetch: refetchFee } = useFactoryFeeBps();
  const { data: isPaused, refetch: refetchPaused } = useFactoryPaused();
  const { data: markets } = useAllMarkets();
  const { data: multiMarkets } = useMultiMarkets();

  const isAdmin = isConnected && address && owner &&
    address.toLowerCase() === owner.toLowerCase();

  const { pauseFactory, unpauseFactory, setFeeBps, setOracle, setFeeCollector,
    pauseMarket, unpauseMarket, deactivateMarket, isPending } = useFactoryAdmin();
  const { setResolution, isPending: resolvePending } = useSetOracleResolution();

  const [newFee, setNewFee] = useState("");
  const [newOracle, setNewOracle] = useState("");
  const [newCollector, setNewCollector] = useState("");
  const [txError, setTxError] = useState("");
  const [txSuccess, setTxSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"yesno"|"multi">("yesno");

  const exec = async (fn: () => Promise<any>, successMsg: string) => {
    setTxError(""); setTxSuccess("");
    try { await fn(); setTxSuccess(successMsg); refetchFee(); refetchPaused(); }
    catch(e: any) { setTxError(e?.shortMessage || e?.message || "Failed"); }
  };

  const allMarkets = (markets as MarketMetadata[]|undefined) ?? [];
  const allMulti = (multiMarkets as any[]|undefined) ?? [];

  if (!isConnected) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"rgba(var(--warn-rgb),0.1)", border:"1px solid rgba(var(--warn-rgb),0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Shield size={28} color="var(--warn)"/>
        </div>
        <p style={{ color:"var(--faint)", fontSize:14 }}>Connect your wallet to access the admin panel</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"rgba(var(--down-rgb),0.1)", border:"1px solid rgba(var(--down-rgb),0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <AlertTriangle size={28} color="var(--down)"/>
        </div>
        <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:20, marginBottom:8 }}>Access Denied</h2>
        <p style={{ color:"var(--faint)", fontSize:14 }}>Only the factory owner ({owner?shortenAddress(owner):"—"}) can access this panel.</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 16px 64px", boxSizing:"border-box" as const }}>
      <style>{`select option{background:var(--bg-2)} input:focus{border-color:rgba(var(--accent-rgb),0.4)!important;outline:none} select:focus{outline:none;border-color:rgba(var(--accent-rgb),0.3)!important}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"rgba(var(--warn-rgb),0.1)", border:"1px solid rgba(var(--warn-rgb),0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Shield size={22} color="var(--warn)"/>
        </div>
        <div>
          <h1 style={{ color:"var(--text)", fontWeight:900, fontSize:22, margin:0 }}>Admin Panel</h1>
          <p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>Verity Factory Control</p>
        </div>
      </div>

      {/* Alerts */}
      {txSuccess&&<div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:12, background:"rgba(var(--up-rgb),0.1)", border:"1px solid rgba(var(--up-rgb),0.2)", color:"var(--up)", fontSize:13, marginBottom:16 }}><CheckCircle size={15}/>{txSuccess}</div>}
      {txError&&<div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:12, background:"rgba(var(--down-rgb),0.1)", border:"1px solid rgba(var(--down-rgb),0.2)", color:"var(--down)", fontSize:13, marginBottom:16 }}><AlertTriangle size={15}/>{txError}</div>}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:24 }}>
        <StatCard label="Factory" value={shortenAddress(FACTORY_ADDRESS)}/>
        <StatCard label="YES/NO Oracle" value={shortenAddress(ORACLE_ADDRESS)}/>
        <StatCard label="Multi Oracle" value={shortenAddress(MULTI_ORACLE_ADDRESS)}/>
        <StatCard label="Protocol Fee" value={feeBps!==undefined?`${Number(feeBps)/100}%`:"—"} color="var(--accent)"/>
        <StatCard label="Factory Status" value={isPaused?"PAUSED":"ACTIVE"} color={isPaused?"var(--down)":"var(--up)"}/>
        <StatCard label="YES/NO Markets" value={String(allMarkets.length)} color="var(--accent-3)"/>
        <StatCard label="Multi Markets" value={String(allMulti.length)} color="#f97316"/>
      </div>

      {/* Factory Controls */}
      <div style={{ ...card, marginBottom:20 }}>
        <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:15, marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
          <Settings size={16} color="var(--accent)"/>Factory Controls
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          <div>
            <span style={labelStyle}>Emergency Controls</span>
            <div style={{ display:"flex", gap:8 }}>
              <ActionBtn label="Pause" color="red" icon={<Pause size={12}/>} disabled={isPending||!!isPaused} onClick={()=>exec(()=>pauseFactory(),"Factory paused")}/>
              <ActionBtn label="Unpause" color="green" icon={<Play size={12}/>} disabled={isPending||!isPaused} onClick={()=>exec(()=>unpauseFactory(),"Factory unpaused")}/>
            </div>
          </div>
          <div>
            <span style={labelStyle}>Protocol Fee (bps)</span>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" value={newFee} onChange={e=>setNewFee(e.target.value)} placeholder={feeBps!==undefined?String(Number(feeBps)):"200"} min="0" max="500" style={{ ...input, flex:1 }}/>
              <button onClick={()=>exec(()=>setFeeBps(BigInt(newFee||"200")),`Fee: ${newFee} bps`)} disabled={isPending||!newFee}
                style={{ padding:"10px 14px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", border:"1px solid rgba(var(--accent-rgb),0.3)", background:"rgba(var(--accent-rgb),0.1)", color:"var(--accent)" }}>Set</button>
            </div>
            <p style={{ color:"var(--faint-2)", fontSize:11, marginTop:4 }}>100 bps = 1% · Max 500</p>
          </div>
          <div>
            <span style={labelStyle}>Oracle Address</span>
            <div style={{ display:"flex", gap:8 }}>
              <input type="text" value={newOracle} onChange={e=>setNewOracle(e.target.value)} placeholder="0x..." style={{ ...input, flex:1 }}/>
              <button onClick={()=>exec(()=>setOracle(newOracle as `0x${string}`),"Oracle updated")} disabled={isPending||!newOracle.startsWith("0x")}
                style={{ padding:"10px 14px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", border:"1px solid rgba(var(--accent-rgb),0.3)", background:"rgba(var(--accent-rgb),0.1)", color:"var(--accent)" }}>Set</button>
            </div>
          </div>
          <div>
            <span style={labelStyle}>Fee Collector</span>
            <div style={{ display:"flex", gap:8 }}>
              <input type="text" value={newCollector} onChange={e=>setNewCollector(e.target.value)} placeholder="0x..." style={{ ...input, flex:1 }}/>
              <button onClick={()=>exec(()=>setFeeCollector(newCollector as `0x${string}`),"Collector updated")} disabled={isPending||!newCollector.startsWith("0x")}
                style={{ padding:"10px 14px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", border:"1px solid rgba(var(--accent-rgb),0.3)", background:"rgba(var(--accent-rgb),0.1)", color:"var(--accent)" }}>Set</button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Management */}
      <div style={card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:15, display:"flex", alignItems:"center", gap:8, margin:0 }}>
            <Sliders size={16} color="var(--accent)"/>Market Management
          </h2>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, background:"rgba(var(--fg-rgb),0.04)", borderRadius:10, padding:4 }}>
            <button onClick={()=>setActiveTab("yesno")} style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background:activeTab==="yesno"?"rgba(var(--accent-rgb),0.15)":"transparent", color:activeTab==="yesno"?"var(--accent)":"var(--faint)" }}>
              YES/NO ({allMarkets.length})
            </button>
            <button onClick={()=>setActiveTab("multi")} style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background:activeTab==="multi"?"rgba(var(--accent3-rgb),0.15)":"transparent", color:activeTab==="multi"?"var(--accent-3)":"var(--faint)", display:"flex", alignItems:"center", gap:6 }}>
              <Layers size={12}/>Multi ({allMulti.length})
            </button>
          </div>
        </div>

        {/* YES/NO Markets */}
        {activeTab==="yesno"&&(
          allMarkets.length===0
            ? <p style={{ color:"var(--faint-2)", fontSize:14 }}>No YES/NO markets deployed yet.</p>
            : allMarkets.map(m=>(
                <MarketRow key={m.marketId} m={{
                  ...m,
                  pauseMarket, unpauseMarket, deactivateMarket
                }} onExec={exec} isPending={isPending} resolvePending={resolvePending}/>
              ))
        )}

        {/* Multi-Outcome Markets */}
        {activeTab==="multi"&&(
          allMulti.length===0
            ? <p style={{ color:"var(--faint-2)", fontSize:14 }}>No multi-outcome markets deployed yet.</p>
            : allMulti.map((m: any, i: number)=>(
                <MultiMarketRow key={i} market={m}/>
              ))
        )}
      </div>
    </div>
  );
}