"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useCreateMultiMarket } from "@/hooks/useMultiOutcome";
import { Plus, X, ChevronRight, CheckCircle, Wallet } from "lucide-react";

const DURATIONS = [
  { label:"3 Days", hours:72, icon:"📅" },
  { label:"1 Week", hours:168, icon:"🗓️" },
  { label:"2 Weeks", hours:336, icon:"📆" },
  { label:"1 Month", hours:720, icon:"🌙" },
  { label:"3 Months", hours:2160, icon:"🌸" },
  { label:"Custom", hours:0, icon:"✏️" },
];

const TEMPLATES = [
  { label:"Election", outcomes:["Candidate A","Candidate B","Candidate C"] },
  { label:"Sports", outcomes:["Team A Wins","Team B Wins","Draw"] },
  { label:"Price Range", outcomes:["< $2000","$2000-$3000","$3000-$5000","> $5000"] },
  { label:"Yes/No/Maybe", outcomes:["Yes","No","Unlikely"] },
];

const COLORS = ["var(--accent)","var(--accent-3)","#f97316","var(--up)","var(--warn)","var(--down)","var(--accent-2)","#ec4899","var(--accent-3)","#14b8a6"];

export default function CreateMultiPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createMarket, isPending, isConfirming, isSuccess } = useCreateMultiMarket();
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState("");
  const [outcomes, setOutcomes] = useState(["","",""]);
  const [durationHours, setDurationHours] = useState(168);
  const [customDays, setCustomDays] = useState(30);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const addOutcome = () => { if (outcomes.length < 10) setOutcomes([...outcomes, ""]); };
  const removeOutcome = (i: number) => { if (outcomes.length > 2) setOutcomes(outcomes.filter((_,idx)=>idx!==i)); };
  const updateOutcome = (i: number, val: string) => setOutcomes(outcomes.map((o,idx)=>idx===i?val:o));

  const validOutcomes = outcomes.filter(o => o.trim().length > 0);
  const effectiveHours = durationHours === 0 ? customDays * 24 : durationHours;

  const handleSubmit = async () => {
    if (!question.trim() || question.length < 10) { setError("Question needs at least 10 characters"); return; }
    if (validOutcomes.length < 2) { setError("Add at least 2 outcomes"); return; }
    const hasDupes = new Set(validOutcomes.map(o=>o.toLowerCase())).size !== validOutcomes.length;
    if (hasDupes) { setError("Outcomes must be unique"); return; }
    setError("");
    try {
      await createMarket(question.trim(), validOutcomes, BigInt(Math.floor(Date.now()/1000) + effectiveHours*3600 + 300));
    } catch(e: any) { setError(e?.shortMessage || e?.message || "Transaction failed"); }
  };

  const card = { background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.08)", borderRadius:20, padding:28 };
  const btnNext = { display:"flex" as const, alignItems:"center" as const, justifyContent:"center" as const, gap:8, width:"100%", marginTop:20, padding:14, borderRadius:12, background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", border:"none", color:"var(--text)", fontWeight:700, fontSize:15, cursor:"pointer" };

  if (isSuccess) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:440 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(var(--accent3-rgb),0.15)", border:"2px solid rgba(var(--accent3-rgb),0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
          <CheckCircle size={40} color="var(--accent-3)"/>
        </div>
        <h1 style={{ color:"var(--text)", fontSize:28, fontWeight:800, marginBottom:8 }}>Market Created! 🎯</h1>
        <p style={{ color:"var(--faint)", fontSize:15, marginBottom:32, lineHeight:1.6 }}>Your multi-outcome market is live on Sepolia.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={()=>router.push("/multi")} style={{ padding:"12px 24px", borderRadius:12, background:"var(--accent-3)", border:"none", color:"var(--text)", fontWeight:700, cursor:"pointer", fontSize:14 }}>View Markets</button>
          <button onClick={()=>{setQuestion("");setOutcomes(["","",""]);setStep(1);}} style={{ padding:"12px 24px", borderRadius:12, background:"rgba(var(--fg-rgb),0.06)", border:"1px solid rgba(var(--fg-rgb),0.1)", color:"var(--text)", fontWeight:600, cursor:"pointer", fontSize:14 }}>Create Another</button>
        </div>
      </div>
    </div>
  );

  if (mounted && !isConnected) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:360 }}>
        <div style={{ width:72, height:72, borderRadius:20, background:"rgba(var(--accent3-rgb),0.1)", border:"1px solid rgba(var(--accent3-rgb),0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <Wallet size={32} color="var(--accent-3)"/>
        </div>
        <h2 style={{ color:"var(--text)", fontSize:22, fontWeight:700, marginBottom:8 }}>Connect Wallet</h2>
        <p style={{ color:"var(--faint)", fontSize:14, lineHeight:1.6 }}>Connect your wallet to create multi-outcome markets.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", padding:"40px 24px" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fadeUp 0.25s ease forwards}`}</style>
      <div style={{ maxWidth:660, margin:"0 auto" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(var(--accent3-rgb),0.08)", border:"1px solid rgba(var(--accent3-rgb),0.2)", color:"var(--accent-3)", fontSize:12, fontWeight:600, marginBottom:14 }}>
            🎯 Multi-Outcome Market
          </div>
          <h1 style={{ color:"var(--text)", fontSize:30, fontWeight:900, margin:"0 0 6px" }}>Create Multi-Outcome Market</h1>
          <p style={{ color:"var(--faint)", fontSize:14, margin:0 }}>Let traders predict which of multiple outcomes will happen</p>
        </div>

        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
          {[{n:1,label:"Question"},{n:2,label:"Outcomes"},{n:3,label:"Duration"},{n:4,label:"Deploy"}].map((s,i)=>(
            <div key={s.n} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", gap:5 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, transition:"all 0.3s",
                  background:step>s.n?"var(--accent-3)":step===s.n?"rgba(var(--accent3-rgb),0.15)":"rgba(var(--fg-rgb),0.04)",
                  border:step>=s.n?"2px solid var(--accent-3)":"2px solid rgba(var(--fg-rgb),0.08)",
                  color:step>s.n?"white":step===s.n?"var(--accent-3)":"var(--faint-2)" }}>
                  {step>s.n?"✓":s.n}
                </div>
                <span style={{ fontSize:11, color:step>=s.n?"var(--accent-3)":"var(--faint-2)", fontWeight:600 }}>{s.label}</span>
              </div>
              {i<3&&<div style={{ flex:1, height:2, background:step>i+1?"var(--accent-3)":"rgba(var(--fg-rgb),0.05)", margin:"0 6px", marginBottom:22, transition:"all 0.3s" }}/>}
            </div>
          ))}
        </div>

        {/* Step 1: Question */}
        {step===1&&(
          <div className="fu" style={card}>
            <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:"0 0 6px" }}>Market Question</h2>
            <p style={{ color:"var(--faint)", fontSize:13, margin:"0 0 16px" }}>What event are you predicting?</p>
            <textarea value={question} onChange={e=>{setQuestion(e.target.value);setError("");}} placeholder="Who will win the 2025 World Series?" rows={3} maxLength={200}
              style={{ width:"100%", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:12, padding:16, color:"var(--text)", fontSize:15, resize:"none" as const, fontFamily:"inherit", boxSizing:"border-box" as const, lineHeight:1.6, outline:"none" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
              <span style={{ color:question.length>180?"var(--down)":"var(--faint-2)", fontSize:12 }}>{question.length}/200</span>
              {question.length>=10&&<span style={{ color:"var(--up)", fontSize:12 }}>✓ Looks good!</span>}
            </div>
            <div style={{ marginTop:14, padding:"12px 16px", borderRadius:12, background:"rgba(var(--accent3-rgb),0.04)", border:"1px solid rgba(var(--accent3-rgb),0.1)" }}>
              <p style={{ color:"var(--accent-3)", fontSize:12, fontWeight:600, marginBottom:4 }}>💡 Tips</p>
              <p style={{ color:"var(--faint)", fontSize:12, margin:0, lineHeight:1.7 }}>• Ask about which specific option will win<br/>• Include a clear timeframe<br/>• Make outcomes mutually exclusive</p>
            </div>
            {error&&<div style={{ color:"var(--down)", fontSize:13, marginTop:12, padding:"10px 14px", background:"rgba(var(--down-rgb),0.1)", borderRadius:10 }}>{error}</div>}
            <button onClick={()=>{if(!question.trim()||question.length<10){setError("At least 10 characters required");return;}setError("");setStep(2);}} style={btnNext}>
              Continue <ChevronRight size={16}/>
            </button>
          </div>
        )}

        {/* Step 2: Outcomes */}
        {step===2&&(
          <div className="fu" style={card}>
            <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:"0 0 6px" }}>Add Outcomes</h2>
            <p style={{ color:"var(--faint)", fontSize:13, margin:"0 0 16px" }}>Add 2-10 possible outcomes. Each must be unique.</p>

            {/* Templates */}
            <div style={{ marginBottom:16 }}>
              <p style={{ color:"var(--faint)", fontSize:12, marginBottom:8 }}>Quick templates:</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" as const }}>
                {TEMPLATES.map(t=>(
                  <button key={t.label} onClick={()=>setOutcomes([...t.outcomes, ""])}
                    style={{ padding:"5px 12px", borderRadius:8, background:"rgba(var(--accent3-rgb),0.1)", border:"1px solid rgba(var(--accent3-rgb),0.2)", color:"var(--accent-3)", fontSize:12, cursor:"pointer", fontWeight:500 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column" as const, gap:10, marginBottom:16 }}>
              {outcomes.map((o, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:`${COLORS[i%COLORS.length]}18`, border:`1px solid ${COLORS[i%COLORS.length]}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ color:COLORS[i%COLORS.length], fontSize:12, fontWeight:700 }}>{i+1}</span>
                  </div>
                  <input value={o} onChange={e=>updateOutcome(i, e.target.value)} placeholder={`Outcome ${i+1}`}
                    style={{ flex:1, background:"rgba(0,0,0,0.3)", border:`1px solid ${o.trim()?COLORS[i%COLORS.length]+"40":"rgba(var(--fg-rgb),0.1)"}`, borderRadius:10, padding:"10px 14px", color:"var(--text)", fontSize:14, outline:"none", fontFamily:"inherit" }}/>
                  {outcomes.length > 2 && (
                    <button onClick={()=>removeOutcome(i)} style={{ width:28, height:28, borderRadius:8, background:"rgba(var(--down-rgb),0.1)", border:"1px solid rgba(var(--down-rgb),0.2)", color:"var(--down)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <X size={14}/>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {outcomes.length < 10 && (
              <button onClick={addOutcome} style={{ width:"100%", padding:"10px", borderRadius:10, background:"rgba(var(--accent3-rgb),0.06)", border:"1px dashed rgba(var(--accent3-rgb),0.3)", color:"var(--accent-3)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:14, fontWeight:600 }}>
                <Plus size={15}/>Add Outcome ({outcomes.length}/10)
              </button>
            )}

            {error&&<div style={{ color:"var(--down)", fontSize:13, marginTop:12, padding:"10px 14px", background:"rgba(var(--down-rgb),0.1)", borderRadius:10 }}>{error}</div>}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20 }}>
              <button onClick={()=>setStep(1)} style={{ padding:13, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)", fontWeight:600, cursor:"pointer" }}>← Back</button>
              <button onClick={()=>{if(validOutcomes.length<2){setError("Add at least 2 outcomes");return;}const hasDupes=new Set(validOutcomes.map(o=>o.toLowerCase())).size!==validOutcomes.length;if(hasDupes){setError("Outcomes must be unique");return;}setError("");setStep(3);}}
                style={{ padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", border:"none", color:"var(--text)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                Continue <ChevronRight size={15}/>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Duration */}
        {step===3&&(
          <div className="fu" style={card}>
            <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:"0 0 6px" }}>Duration</h2>
            <p style={{ color:"var(--faint)", fontSize:13, margin:"0 0 16px" }}>How long will trading be open?</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
              {DURATIONS.map(d=>(
                <button key={d.hours} onClick={()=>setDurationHours(d.hours)} style={{ padding:"16px 10px", borderRadius:14, border:durationHours===d.hours?"2px solid rgba(var(--accent3-rgb),0.5)":"1px solid rgba(var(--fg-rgb),0.07)", background:durationHours===d.hours?"rgba(var(--accent3-rgb),0.1)":"rgba(var(--fg-rgb),0.03)", cursor:"pointer", textAlign:"center" as const }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{d.icon}</div>
                  <div style={{ color:durationHours===d.hours?"var(--accent-3)":"var(--muted)", fontSize:12, fontWeight:600 }}>{d.label}</div>
                </button>
              ))}
            </div>
            {durationHours===0&&(
              <div style={{ padding:"14px 16px", borderRadius:12, background:"rgba(var(--fg-rgb),0.04)", border:"1px solid rgba(var(--fg-rgb),0.1)", marginBottom:12 }}>
                <label style={{ color:"var(--muted)", fontSize:12, fontWeight:600, display:"block", marginBottom:8 }}>CUSTOM DURATION (DAYS)</label>
                <input type="number" min={1} max={1460} value={customDays} onChange={e=>setCustomDays(Math.max(1,Math.min(1460,parseInt(e.target.value)||1)))}
                  style={{ width:"100%", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(var(--fg-rgb),0.15)", borderRadius:10, padding:"10px 14px", color:"var(--text)", fontSize:16, fontFamily:"var(--font-mono)", outline:"none", boxSizing:"border-box" as const }}/>
              </div>
            )}
            <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(var(--accent3-rgb),0.06)", border:"1px solid rgba(var(--accent3-rgb),0.15)", display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <span style={{ fontSize:18 }}>⏰</span>
              <p style={{ color:"var(--accent-3)", fontSize:13, margin:0 }}>Expires: <strong>{new Date(Date.now()+effectiveHours*3600000).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</strong></p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={()=>setStep(2)} style={{ padding:13, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)", fontWeight:600, cursor:"pointer" }}>← Back</button>
              <button onClick={()=>setStep(4)} style={{ padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--accent-3),var(--accent-3))", border:"none", color:"var(--text)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>Review <ChevronRight size={15}/></button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step===4&&(
          <div className="fu">
            <div style={{ ...card, marginBottom:14 }}>
              <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:18, marginBottom:20 }}>Review & Deploy</h2>
              <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
                <div style={{ padding:16, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:8 }}>Question</p>
                  <p style={{ color:"var(--text)", fontSize:15, fontWeight:600, lineHeight:1.5, margin:0 }}>{question}</p>
                </div>
                <div style={{ padding:16, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:10 }}>Outcomes ({validOutcomes.length})</p>
                  <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8 }}>
                    {validOutcomes.map((o,i)=>(
                      <span key={i} style={{ padding:"4px 12px", borderRadius:99, fontSize:13, fontWeight:600, background:`${COLORS[i%COLORS.length]}18`, color:COLORS[i%COLORS.length], border:`1px solid ${COLORS[i%COLORS.length]}30` }}>{o}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(var(--accent3-rgb),0.05)", border:"1px solid rgba(var(--accent3-rgb),0.12)" }}>
                  {[["Network","Sepolia Testnet"],["Fee","2%"],["Expires",new Date(Date.now()+effectiveHours*3600000).toLocaleDateString()]].map(([k,v],idx)=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginTop:idx>0?8:0, paddingTop:idx>0?8:0, borderTop:idx>0?"1px solid rgba(var(--fg-rgb),0.04)":"none" }}>
                      <span style={{ color:"var(--faint)" }}>{k}</span><span style={{ color:"var(--accent-3)", fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {error&&<div style={{ color:"var(--down)", fontSize:13, marginBottom:12, padding:"12px 16px", background:"rgba(var(--down-rgb),0.1)", borderRadius:12, border:"1px solid rgba(var(--down-rgb),0.2)" }}>{error}</div>}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10 }}>
              <button onClick={()=>setStep(3)} style={{ padding:14, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)", fontWeight:600, cursor:"pointer" }}>← Edit</button>
              <button onClick={handleSubmit} disabled={isPending||isConfirming}
                style={{ padding:14, borderRadius:12, background:isPending||isConfirming?"rgba(var(--accent3-rgb),0.3)":"linear-gradient(135deg,var(--accent-3),var(--accent-3))", border:"none", color:"var(--text)", fontWeight:800, fontSize:16, cursor:isPending||isConfirming?"wait":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {isPending?"⏳ Confirm in wallet...":isConfirming?"⏳ Deploying...":"🎯 Deploy Multi-Outcome Market"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
