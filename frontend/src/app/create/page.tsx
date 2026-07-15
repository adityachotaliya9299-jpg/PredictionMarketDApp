"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useCreateMarket } from "@/hooks/useTransactions";
import { CATEGORIES } from "@/types/market";
import { Zap, Clock, Tag, ChevronRight, CheckCircle, Wallet } from "lucide-react";

const DURATIONS = [
  { label:"1 Day", hours:24, icon:"🌅" },
  { label:"3 Days", hours:72, icon:"📅" },
  { label:"1 Week", hours:168, icon:"🗓️" },
  { label:"2 Weeks", hours:336, icon:"📆" },
  { label:"1 Month", hours:720, icon:"🌙" },
  { label:"3 Months", hours:2160, icon:"🌸" },
  { label:"6 Months", hours:4320, icon:"☀️" },
  { label:"1 Year", hours:8760, icon:"🎯" },
  { label:"Custom", hours:0, icon:"✏️" },
];
const ICONS: Record<string,string> = { Crypto:"₿",Politics:"🏛️",Sports:"⚽",Science:"🔬",Entertainment:"🎬",Economics:"📈",Technology:"💻",General:"🌐" };
const EXAMPLES = ["Will ETH reach $10,000 before Dec 31, 2025?","Will Bitcoin dominate over 60% market cap by Q3 2025?","Will AI surpass human performance in chess by 2026?"];

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createMarket, isPending, isConfirming, isSuccess } = useCreateMarket();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Crypto");
  const [durationHours, setDurationHours] = useState(168);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);
  const [customDays, setCustomDays] = useState(30);
  const [step, setStep] = useState(168);
  const [exIdx, setExIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
    setStep(1);
    setDone(false);
    setQuestion("");
    setCategory("Crypto");
    setDurationHours(168);
    const t = setInterval(() => setExIdx(i => (i+1) % EXAMPLES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const submit = async () => {
    if (!question.trim() || question.length < 10) { setError("At least 10 characters required"); return; }
    setError("");
    try { await createMarket(question.trim(), category, BigInt(Math.floor(Date.now()/1000) + (durationHours===0 ? customDays*24 : durationHours)*3600));
      setDone(true); }
    catch(e: any) { setError(e?.shortMessage || e?.message || "Transaction failed"); }
  };

  const sel = DURATIONS.find(d => d.hours === durationHours) ?? { label:`${customDays} Days`, icon:"✏️" };
  const btnBase = { border:"none", fontWeight:700 as const, cursor:"pointer" as const, display:"flex" as const, alignItems:"center" as const, justifyContent:"center" as const, gap:8, transition:"all 0.2s" };
  const card = { background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.08)", borderRadius:20, padding:28 };

  if (done) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:440 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(var(--up-rgb),0.15)", border:"2px solid rgba(var(--up-rgb),0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
          <CheckCircle size={40} color="var(--up)"/>
        </div>
        <h1 style={{ color:"var(--text)", fontSize:28, fontWeight:800, marginBottom:8 }}>Market Live! 🎉</h1>
        <p style={{ color:"var(--faint)", fontSize:15, marginBottom:32, lineHeight:1.6 }}>Your prediction market is deployed on Sepolia.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={()=>router.push("/")} style={{ ...btnBase, padding:"12px 24px", borderRadius:12, background:"var(--accent)", color:"var(--on-accent)", fontSize:14 }}>View Markets</button>
          <button onClick={()=>{setQuestion("");setStep(1);}} style={{ ...btnBase, padding:"12px 24px", borderRadius:12, background:"rgba(var(--fg-rgb),0.06)", border:"1px solid rgba(var(--fg-rgb),0.1)", color:"var(--text)", fontSize:14 }}>Create Another</button>
        </div>
      </div>
    </div>
  );

  if (mounted && !isConnected) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:360 }}>
        <div style={{ width:72, height:72, borderRadius:20, background:"rgba(var(--accent-rgb),0.1)", border:"1px solid rgba(var(--accent-rgb),0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <Wallet size={32} color="var(--accent)"/>
        </div>
        <h2 style={{ color:"var(--text)", fontSize:22, fontWeight:700, marginBottom:8 }}>Connect Your Wallet</h2>
        <p style={{ color:"var(--faint)", fontSize:14, lineHeight:1.6 }}>Use the connect button in the top navbar to create prediction markets.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", padding:"40px 24px" }}>
      <style>{`@keyframes fs{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fs{animation:fs 0.25s ease forwards}textarea:focus{outline:none;border-color:rgba(var(--accent-rgb),0.4)!important;box-shadow:0 0 0 3px rgba(var(--accent-rgb),0.08)}`}</style>
      <div style={{ maxWidth:660, margin:"0 auto" }}>
        <div style={{ marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(var(--accent-rgb),0.08)", border:"1px solid rgba(var(--accent-rgb),0.2)", color:"var(--accent)", fontSize:12, fontWeight:600, marginBottom:14 }}>
            <Zap size={11}/>New Prediction Market
          </div>
          <h1 style={{ color:"var(--text)", fontSize:30, fontWeight:900, margin:"0 0 6px" }}>Create a Market</h1>
          <p style={{ color:"var(--faint)", fontSize:14, margin:0 }}>Launch a YES/NO prediction market on Sepolia testnet</p>
        </div>

        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
          {[{n:1,label:"Question"},{n:2,label:"Category"},{n:3,label:"Duration"},{n:4,label:"Deploy"}].map((s,i)=>(
            <div key={s.n} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", gap:5 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, transition:"all 0.3s", background:step>s.n?"var(--accent)":step===s.n?"rgba(var(--accent-rgb),0.15)":"rgba(var(--fg-rgb),0.04)", border:step>=s.n?"2px solid var(--accent)":"2px solid rgba(var(--fg-rgb),0.08)", color:step>s.n?"black":step===s.n?"var(--accent)":"var(--faint-2)" }}>
                  {step>s.n?"✓":s.n}
                </div>
                <span style={{ fontSize:11, color:step>=s.n?"var(--accent)":"var(--faint-2)", fontWeight:600 }}>{s.label}</span>
              </div>
              {i<3&&<div style={{ flex:1, height:2, background:step>i+1?"var(--accent)":"rgba(var(--fg-rgb),0.05)", margin:"0 6px", marginBottom:22, transition:"all 0.3s" }}/>}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step===1&&<div className="fs" style={card}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"rgba(var(--accent-rgb),0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}><Zap size={18} color="var(--accent)"/></div>
            <div><h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:0 }}>Market Question</h2><p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>A clear YES/NO verifiable question</p></div>
          </div>
          <textarea value={question} onChange={e=>{setQuestion(e.target.value);setError("");}} placeholder={EXAMPLES[exIdx]} rows={4} maxLength={200}
            style={{ width:"100%", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:12, padding:16, color:"var(--text)", fontSize:15, resize:"none" as const, fontFamily:"inherit", boxSizing:"border-box" as const, lineHeight:1.6, transition:"all 0.2s" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
            <span style={{ color:question.length>180?"var(--down)":"var(--faint-2)", fontSize:12 }}>{question.length}/200</span>
            {question.length>=10&&<span style={{ color:"var(--up)", fontSize:12 }}>✓ Looks good!</span>}
          </div>
          <div style={{ marginTop:14, padding:"12px 16px", borderRadius:12, background:"rgba(var(--accent-rgb),0.04)", border:"1px solid rgba(var(--accent-rgb),0.1)" }}>
            <p style={{ color:"var(--accent)", fontSize:12, fontWeight:600, marginBottom:4 }}>💡 Tips</p>
            <p style={{ color:"var(--faint)", fontSize:12, margin:0, lineHeight:1.7 }}>• Must resolve YES or NO<br/>• Include a specific deadline<br/>• Use objective criteria</p>
          </div>
          {error&&<div style={{ color:"var(--down)", fontSize:13, marginTop:12, padding:"10px 14px", background:"rgba(var(--down-rgb),0.1)", borderRadius:10 }}>{error}</div>}
          <button onClick={()=>{if(!question.trim()||question.length<10){setError("At least 10 characters required");return;}setError("");setStep(2);}}
            style={{ ...btnBase, width:"100%", marginTop:20, padding:14, borderRadius:12, background:question.length>=10?"linear-gradient(135deg,var(--accent),var(--accent-2))":"rgba(var(--fg-rgb),0.05)", color:question.length>=10?"black":"var(--faint-2)", fontSize:15 }}>
            Continue <ChevronRight size={16}/>
          </button>
        </div>}

        {/* Step 2 */}
        {step===2&&<div className="fs" style={card}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"rgba(var(--accent3-rgb),0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}><Tag size={18} color="var(--accent-3)"/></div>
            <div><h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:0 }}>Category</h2><p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>Helps traders discover your market</p></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} style={{ padding:"18px 8px", borderRadius:14, border:category===c?"2px solid rgba(var(--accent-rgb),0.5)":"1px solid rgba(var(--fg-rgb),0.07)", background:category===c?"rgba(var(--accent-rgb),0.1)":"rgba(var(--fg-rgb),0.03)", cursor:"pointer", textAlign:"center" as const, transition:"all 0.2s" }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{ICONS[c]}</div>
                <div style={{ color:category===c?"var(--accent)":"var(--muted)", fontSize:12, fontWeight:600 }}>{c}</div>
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20 }}>
            <button onClick={()=>setStep(1)} style={{ ...btnBase, padding:13, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)" }}>← Back</button>
            <button onClick={()=>setStep(3)} style={{ ...btnBase, padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", color:"var(--on-accent)" }}>Continue <ChevronRight size={15}/></button>
          </div>
        </div>}

        {/* Step 3 */}
        {step===3&&<div className="fs" style={card}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"rgba(var(--warn-rgb),0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}><Clock size={18} color="var(--warn)"/></div>
            <div><h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:0 }}>Duration</h2><p style={{ color:"var(--faint)", fontSize:12, margin:0 }}>How long will trading be open?</p></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {DURATIONS.map(d=>(
              <button key={d.hours} onClick={()=>setDurationHours(d.hours)} style={{ padding:"18px 10px", borderRadius:14, border:durationHours===d.hours?"2px solid rgba(var(--accent-rgb),0.5)":"1px solid rgba(var(--fg-rgb),0.07)", background:durationHours===d.hours?"rgba(var(--accent-rgb),0.1)":"rgba(var(--fg-rgb),0.03)", cursor:"pointer", textAlign:"center" as const, transition:"all 0.2s" }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{d.icon}</div>
                <div style={{ color:durationHours===d.hours?"var(--accent)":"var(--muted)", fontSize:13, fontWeight:600 }}>{d.label}</div>
              </button>
            ))}
          </div>
          {durationHours===0&&(
            <div style={{ marginTop:12, padding:"14px 16px", borderRadius:12, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.1)" }}>
              <label style={{ color:"var(--muted)", fontSize:12, fontWeight:600, display:"block", marginBottom:8 }}>CUSTOM DURATION (DAYS)</label>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <input type="number" min={1} max={1460} value={customDays}
                  onChange={e=>{const v=Math.max(1,Math.min(1460,parseInt(e.target.value)||1));setCustomDays(v);}}
                  style={{ flex:1, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(var(--fg-rgb),0.15)", borderRadius:10, padding:"10px 14px", color:"var(--text)", fontSize:16, fontFamily:"var(--font-mono)", outline:"none", boxSizing:"border-box" as const }}/>
                <span style={{ color:"var(--faint)", fontSize:13 }}>days (1–1460)</span>
              </div>
              <p style={{ color:"var(--faint-2)", fontSize:12, marginTop:6 }}>
                Max 4 years = 1460 days
              </p>
            </div>
          )}
          <div style={{ marginTop:16, padding:"12px 16px", borderRadius:12, background:"rgba(var(--warn-rgb),0.06)", border:"1px solid rgba(var(--warn-rgb),0.15)", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>⏰</span>
            <p style={{ color:"var(--warn)", fontSize:13, margin:0 }}>Expires: <strong>{new Date(Date.now()+(durationHours===0?customDays*24:durationHours)*3600000).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</strong></p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20 }}>
            <button onClick={()=>setStep(2)} style={{ ...btnBase, padding:13, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)" }}>← Back</button>
            <button onClick={()=>setStep(4)} style={{ ...btnBase, padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", color:"var(--on-accent)" }}>Review <ChevronRight size={15}/></button>
          </div>
        </div>}

        {/* Step 4 */}
        {step===4&&<div className="fs">
          <div style={{ ...card, marginBottom:14 }}>
            <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:18, marginBottom:20 }}>Review & Deploy</h2>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
              <div style={{ padding:16, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:8 }}>Question</p>
                <p style={{ color:"var(--text)", fontSize:16, fontWeight:600, lineHeight:1.5, margin:0 }}>{question}</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ padding:14, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:6 }}>Category</p>
                  <p style={{ color:"var(--text)", fontSize:15, fontWeight:600, margin:0 }}>{ICONS[category]} {category}</p>
                </div>
                <div style={{ padding:14, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:6 }}>Duration</p>
                  <p style={{ color:"var(--text)", fontSize:15, fontWeight:600, margin:0 }}>{sel.icon} {sel.label}</p>
                </div>
              </div>
              <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(var(--accent-rgb),0.05)", border:"1px solid rgba(var(--accent-rgb),0.12)" }}>
                {[["Network","Sepolia Testnet"],["Protocol Fee","2%"],["Expires",new Date(Date.now()+(durationHours===0?customDays*24:durationHours)*3600000).toLocaleDateString()]].map(([k,v],idx)=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginTop:idx>0?8:0, paddingTop:idx>0?8:0, borderTop:idx>0?"1px solid rgba(var(--fg-rgb),0.04)":"none" }}>
                    <span style={{ color:"var(--faint)" }}>{k}</span><span style={{ color:"var(--accent)", fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {error&&<div style={{ color:"var(--down)", fontSize:13, marginBottom:12, padding:"12px 16px", background:"rgba(var(--down-rgb),0.1)", borderRadius:12, border:"1px solid rgba(var(--down-rgb),0.2)" }}>{error}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10 }}>
            <button onClick={()=>setStep(3)} style={{ ...btnBase, padding:14, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)" }}>← Edit</button>
            <button onClick={submit} disabled={isPending||isConfirming}
              style={{ ...btnBase, padding:14, borderRadius:12, background:isPending||isConfirming?"rgba(var(--accent-rgb),0.3)":"linear-gradient(135deg,var(--accent),var(--accent-2))", color:"var(--on-accent)", fontSize:16, fontWeight:800, cursor:isPending||isConfirming?"wait":"pointer" }}>
              {isPending?"⏳ Confirm in wallet...":isConfirming?"⏳ Deploying...":"🚀 Deploy Market"}
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}
