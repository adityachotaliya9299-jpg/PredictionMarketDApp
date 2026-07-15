"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useCreateUSDCMarket } from "@/hooks/useUSDCMarket";
import { CATEGORIES } from "@/types/market";
import { DollarSign, ChevronRight, CheckCircle, Wallet } from "lucide-react";

const DURATIONS = [
  { label:"3 Days", hours:72, icon:"📅" },
  { label:"1 Week", hours:168, icon:"🗓️" },
  { label:"2 Weeks", hours:336, icon:"📆" },
  { label:"1 Month", hours:720, icon:"🌙" },
  { label:"3 Months", hours:2160, icon:"🌸" },
];

const CATEGORY_ICONS: Record<string,string> = {
  Crypto:"₿", Politics:"🏛️", Sports:"⚽", Science:"🔬",
  Entertainment:"🎬", Economics:"📈", Technology:"💻", General:"🌐"
};

export default function CreateUSDCPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createMarket, isPending, isConfirming, isSuccess } = useCreateUSDCMarket();
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Crypto");
  const [durationHours, setDurationHours] = useState(168);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async () => {
    if (!question.trim() || question.length < 10) { setError("At least 10 characters"); return; }
    setError("");
    try {
      await createMarket(question.trim(), category, BigInt(Math.floor(Date.now()/1000) + durationHours*3600 + 300));
    } catch(e: any) { setError(e?.shortMessage || e?.message || "Failed"); }
  };

  const card = { background:"rgba(var(--fg-rgb),0.03)", border:"1px solid rgba(var(--fg-rgb),0.08)", borderRadius:20, padding:28 };

  if (isSuccess) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:440 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(var(--up-rgb),0.15)", border:"2px solid rgba(var(--up-rgb),0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
          <CheckCircle size={40} color="var(--up)"/>
        </div>
        <h1 style={{ color:"var(--text)", fontSize:28, fontWeight:800, marginBottom:8 }}>USDC Market Live!</h1>
        <p style={{ color:"var(--faint)", fontSize:15, marginBottom:32 }}>Your USDC prediction market is deployed on Sepolia.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={()=>router.push("/usdc")} style={{ padding:"12px 24px", borderRadius:12, background:"var(--up)", border:"none", color:"var(--text)", fontWeight:700, cursor:"pointer", fontSize:14 }}>View Markets</button>
          <button onClick={()=>{setQuestion("");setStep(1);}} style={{ padding:"12px 24px", borderRadius:12, background:"rgba(var(--fg-rgb),0.06)", border:"1px solid rgba(var(--fg-rgb),0.1)", color:"var(--text)", fontWeight:600, cursor:"pointer", fontSize:14 }}>Create Another</button>
        </div>
      </div>
    </div>
  );

  if (mounted && !isConnected) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <Wallet size={40} color="var(--up)" style={{ margin:"0 auto 16px" }}/>
        <h2 style={{ color:"var(--text)", fontSize:22, fontWeight:700, marginBottom:8 }}>Connect Wallet</h2>
        <p style={{ color:"var(--faint)", fontSize:14 }}>Connect to create USDC markets</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", padding:"40px 24px" }}>
      <style>{`@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu 0.25s ease forwards}`}</style>
      <div style={{ maxWidth:660, margin:"0 auto" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(var(--up-rgb),0.08)", border:"1px solid rgba(var(--up-rgb),0.2)", color:"var(--up)", fontSize:12, fontWeight:600, marginBottom:14 }}>
            <DollarSign size={11}/>USDC Market
          </div>
          <h1 style={{ color:"var(--text)", fontSize:30, fontWeight:900, margin:"0 0 6px" }}>Create USDC Market</h1>
          <p style={{ color:"var(--faint)", fontSize:14, margin:0 }}>Trade with USDC stablecoin — no ETH price risk</p>
        </div>

        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
          {[{n:1,label:"Question"},{n:2,label:"Category"},{n:3,label:"Duration"},{n:4,label:"Deploy"}].map((s,i)=>(
            <div key={s.n} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", gap:5 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, transition:"all 0.3s",
                  background:step>s.n?"var(--up)":step===s.n?"rgba(var(--up-rgb),0.15)":"rgba(var(--fg-rgb),0.04)",
                  border:step>=s.n?"2px solid var(--up)":"2px solid rgba(var(--fg-rgb),0.08)",
                  color:step>s.n?"black":step===s.n?"var(--up)":"var(--faint-2)" }}>
                  {step>s.n?"✓":s.n}
                </div>
                <span style={{ fontSize:11, color:step>=s.n?"var(--up)":"var(--faint-2)", fontWeight:600 }}>{s.label}</span>
              </div>
              {i<3&&<div style={{ flex:1, height:2, background:step>i+1?"var(--up)":"rgba(var(--fg-rgb),0.05)", margin:"0 6px", marginBottom:22 }}/>}
            </div>
          ))}
        </div>

        {step===1&&<div className="fu" style={card}>
          <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:"0 0 6px" }}>Market Question</h2>
          <p style={{ color:"var(--faint)", fontSize:13, margin:"0 0 16px" }}>A clear YES/NO question resolved by oracle</p>
          <textarea value={question} onChange={e=>{setQuestion(e.target.value);setError("");}} placeholder="Will ETH reach $5000 before June 2026?" rows={4} maxLength={200}
            style={{ width:"100%", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(var(--fg-rgb),0.1)", borderRadius:12, padding:16, color:"var(--text)", fontSize:15, resize:"none" as const, fontFamily:"inherit", boxSizing:"border-box" as const, lineHeight:1.6, outline:"none" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
            <span style={{ color:question.length>180?"var(--down)":"var(--faint-2)", fontSize:12 }}>{question.length}/200</span>
            {question.length>=10&&<span style={{ color:"var(--up)", fontSize:12 }}>✓ Looks good!</span>}
          </div>
          {error&&<div style={{ color:"var(--down)", fontSize:13, marginTop:12, padding:"10px 14px", background:"rgba(var(--down-rgb),0.1)", borderRadius:10 }}>{error}</div>}
          <button onClick={()=>{if(!question.trim()||question.length<10){setError("At least 10 characters");return;}setError("");setStep(2);}}
            style={{ width:"100%", marginTop:20, padding:14, borderRadius:12, background:question.length>=10?"linear-gradient(135deg,var(--up),var(--up))":"rgba(var(--fg-rgb),0.05)", border:"none", color:question.length>=10?"black":"var(--faint-2)", fontWeight:700, fontSize:15, cursor:question.length>=10?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            Continue <ChevronRight size={16}/>
          </button>
        </div>}

        {step===2&&<div className="fu" style={card}>
          <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:"0 0 16px" }}>Category</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} style={{ padding:"16px 8px", borderRadius:14, border:category===c?"2px solid rgba(var(--up-rgb),0.5)":"1px solid rgba(var(--fg-rgb),0.07)", background:category===c?"rgba(var(--up-rgb),0.1)":"rgba(var(--fg-rgb),0.03)", cursor:"pointer", textAlign:"center" as const }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{CATEGORY_ICONS[c]}</div>
                <div style={{ color:category===c?"var(--up)":"var(--muted)", fontSize:12, fontWeight:600 }}>{c}</div>
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20 }}>
            <button onClick={()=>setStep(1)} style={{ padding:13, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)", fontWeight:600, cursor:"pointer" }}>← Back</button>
            <button onClick={()=>setStep(3)} style={{ padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--up),var(--up))", border:"none", color:"var(--on-accent)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>Continue <ChevronRight size={15}/></button>
          </div>
        </div>}

        {step===3&&<div className="fu" style={card}>
          <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:16, margin:"0 0 16px" }}>Duration</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {DURATIONS.map(d=>(
              <button key={d.hours} onClick={()=>setDurationHours(d.hours)} style={{ padding:"16px 10px", borderRadius:14, border:durationHours===d.hours?"2px solid rgba(var(--up-rgb),0.5)":"1px solid rgba(var(--fg-rgb),0.07)", background:durationHours===d.hours?"rgba(var(--up-rgb),0.1)":"rgba(var(--fg-rgb),0.03)", cursor:"pointer", textAlign:"center" as const }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{d.icon}</div>
                <div style={{ color:durationHours===d.hours?"var(--up)":"var(--muted)", fontSize:12, fontWeight:600 }}>{d.label}</div>
              </button>
            ))}
          </div>
          <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(var(--up-rgb),0.06)", border:"1px solid rgba(var(--up-rgb),0.15)", display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <span style={{ fontSize:18 }}>⏰</span>
            <p style={{ color:"var(--up)", fontSize:13, margin:0 }}>Expires: <strong>{new Date(Date.now()+durationHours*3600000).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</strong></p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <button onClick={()=>setStep(2)} style={{ padding:13, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)", fontWeight:600, cursor:"pointer" }}>← Back</button>
            <button onClick={()=>setStep(4)} style={{ padding:13, borderRadius:12, background:"linear-gradient(135deg,var(--up),var(--up))", border:"none", color:"var(--on-accent)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>Review <ChevronRight size={15}/></button>
          </div>
        </div>}

        {step===4&&<div className="fu">
          <div style={{ ...card, marginBottom:14 }}>
            <h2 style={{ color:"var(--text)", fontWeight:700, fontSize:18, marginBottom:20 }}>Review & Deploy</h2>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
              <div style={{ padding:16, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:8 }}>Question</p>
                <p style={{ color:"var(--text)", fontSize:15, fontWeight:600, lineHeight:1.5, margin:0 }}>{question}</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ padding:14, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:6 }}>Category</p>
                  <p style={{ color:"var(--text)", fontSize:14, fontWeight:600, margin:0 }}>{CATEGORY_ICONS[category]} {category}</p>
                </div>
                <div style={{ padding:14, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(var(--fg-rgb),0.06)" }}>
                  <p style={{ color:"var(--faint)", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:6 }}>Currency</p>
                  <p style={{ color:"var(--up)", fontSize:14, fontWeight:600, margin:0 }}>💵 USDC</p>
                </div>
              </div>
              <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(var(--up-rgb),0.05)", border:"1px solid rgba(var(--up-rgb),0.12)" }}>
                {[["Network","Sepolia Testnet"],["Currency","USDC (Stablecoin)"],["Fee","2%"],["Expires",new Date(Date.now()+durationHours*3600000).toLocaleDateString()]].map(([k,v],idx)=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginTop:idx>0?8:0, paddingTop:idx>0?8:0, borderTop:idx>0?"1px solid rgba(var(--fg-rgb),0.04)":"none" }}>
                    <span style={{ color:"var(--faint)" }}>{k}</span><span style={{ color:"var(--up)", fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {error&&<div style={{ color:"var(--down)", fontSize:13, marginBottom:12, padding:"12px 16px", background:"rgba(var(--down-rgb),0.1)", borderRadius:12 }}>{error}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10 }}>
            <button onClick={()=>setStep(3)} style={{ padding:14, borderRadius:12, background:"rgba(var(--fg-rgb),0.05)", border:"1px solid rgba(var(--fg-rgb),0.08)", color:"var(--muted)", fontWeight:600, cursor:"pointer" }}>← Edit</button>
            <button onClick={handleSubmit} disabled={isPending||isConfirming}
              style={{ padding:14, borderRadius:12, background:isPending||isConfirming?"rgba(var(--up-rgb),0.3)":"linear-gradient(135deg,var(--up),var(--up))", border:"none", color:"var(--on-accent)", fontWeight:800, fontSize:16, cursor:isPending||isConfirming?"wait":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {isPending?"⏳ Confirm...":isConfirming?"⏳ Deploying...":"💵 Deploy USDC Market"}
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}
