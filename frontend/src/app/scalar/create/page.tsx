"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useCreateScalarMarket } from "@/hooks/useUSDCMarket";
import { Plus, X, ChevronRight, CheckCircle } from "lucide-react";

const ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const BTC_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";

const FEED_OPTIONS = [
  { label:"ETH/USD", address:ETH_FEED, icon:"Ξ", color:"#627EEA" },
  { label:"BTC/USD", address:BTC_FEED, icon:"₿", color:"#F7931A" },
];

const RANGE_TEMPLATES = {
  "ETH/USD": ["< $1,500","$1,500 - $2,500","$2,500 - $3,500","$3,500 - $5,000","> $5,000"],
  "BTC/USD": ["< $50,000","$50,000 - $75,000","$75,000 - $100,000","$100,000 - $150,000","> $150,000"],
};

const DURATIONS = [
  { label:"3 Days", hours:72, icon:"📅" },
  { label:"1 Week", hours:168, icon:"🗓️" },
  { label:"2 Weeks", hours:336, icon:"📆" },
  { label:"1 Month", hours:720, icon:"🌙" },
];

const COLORS = ["#22d3ee","#a855f7","#f97316","#10b981","#f59e0b","#ef4444"];

export default function CreateScalarPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createMarket, isPending, isConfirming, isSuccess } = useCreateScalarMarket();
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState("");
  const [ranges, setRanges] = useState(["","","",""]);
  const [priceFeed, setPriceFeed] = useState(ETH_FEED);
  const [durationHours, setDurationHours] = useState(168);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const validRanges = ranges.filter(r => r.trim().length > 0);
  const selectedFeed = FEED_OPTIONS.find(f=>f.address===priceFeed)!;

  const applyTemplate = () => {
    const template = RANGE_TEMPLATES[selectedFeed.label as keyof typeof RANGE_TEMPLATES];
    if (template) setRanges([...template]);
    if (!question) setQuestion(`What will ${selectedFeed.label} price be at expiry?`);
  };

  const handleSubmit = async () => {
    if (!question.trim() || question.length < 10) { setError("Question too short"); return; }
    if (validRanges.length < 2) { setError("Add at least 2 ranges"); return; }
    setError("");
    try {
      await createMarket(question.trim(), validRanges, priceFeed, BigInt(Math.floor(Date.now()/1000) + durationHours*3600 + 300));
    } catch(e: any) { setError(e?.shortMessage || e?.message || "Failed"); }
  };

  const card = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:28 };

  if (isSuccess) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:440 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(251,191,36,0.15)", border:"2px solid rgba(251,191,36,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
          <CheckCircle size={40} color="#fbbf24"/>
        </div>
        <h1 style={{ color:"white", fontSize:28, fontWeight:800, marginBottom:8 }}>Scalar Market Live! 📊</h1>
        <p style={{ color:"#6b7280", fontSize:15, marginBottom:32 }}>Your price-range market is deployed on Sepolia.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={()=>router.push("/scalar")} style={{ padding:"12px 24px", borderRadius:12, background:"#fbbf24", border:"none", color:"black", fontWeight:700, cursor:"pointer" }}>View Markets</button>
          <button onClick={()=>{setQuestion("");setStep(1);}} style={{ padding:"12px 24px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontWeight:600, cursor:"pointer" }}>Create Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#050508", padding:"40px 24px" }}>
      <style>{`@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu 0.25s ease forwards}`}</style>
      <div style={{ maxWidth:660, margin:"0 auto" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.2)", color:"#fbbf24", fontSize:12, fontWeight:600, marginBottom:14 }}>
            📊 Scalar Market
          </div>
          <h1 style={{ color:"white", fontSize:30, fontWeight:900, margin:"0 0 6px" }}>Create Scalar Market</h1>
          <p style={{ color:"#6b7280", fontSize:14, margin:0 }}>Let traders predict price ranges using Chainlink live data</p>
        </div>

        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
          {[{n:1,label:"Feed"},{n:2,label:"Ranges"},{n:3,label:"Duration"},{n:4,label:"Deploy"}].map((s,i)=>(
            <div key={s.n} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", gap:5 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13,
                  background:step>s.n?"#fbbf24":step===s.n?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.04)",
                  border:step>=s.n?"2px solid #fbbf24":"2px solid rgba(255,255,255,0.08)",
                  color:step>s.n?"black":step===s.n?"#fbbf24":"#4b5563" }}>
                  {step>s.n?"✓":s.n}
                </div>
                <span style={{ fontSize:11, color:step>=s.n?"#fbbf24":"#4b5563", fontWeight:600 }}>{s.label}</span>
              </div>
              {i<3&&<div style={{ flex:1, height:2, background:step>i+1?"#fbbf24":"rgba(255,255,255,0.05)", margin:"0 6px", marginBottom:22 }}/>}
            </div>
          ))}
        </div>

        {/* Step 1: Price Feed */}
        {step===1&&<div className="fu" style={card}>
          <h2 style={{ color:"white", fontWeight:700, fontSize:16, margin:"0 0 6px" }}>Select Price Feed</h2>
          <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 16px" }}>Which Chainlink price feed will this market track?</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            {FEED_OPTIONS.map(f=>(
              <button key={f.address} onClick={()=>setPriceFeed(f.address)}
                style={{ padding:"20px 16px", borderRadius:14, border:priceFeed===f.address?`2px solid ${f.color}`:"1px solid rgba(255,255,255,0.08)", background:priceFeed===f.address?`${f.color}12`:"rgba(255,255,255,0.03)", cursor:"pointer", textAlign:"center" as const }}>
                <div style={{ fontSize:32, color:f.color, marginBottom:8 }}>{f.icon}</div>
                <div style={{ color:priceFeed===f.address?f.color:"#9ca3af", fontWeight:700, fontSize:14 }}>{f.label}</div>
                <div style={{ color:"#4b5563", fontSize:11, marginTop:4 }}>Chainlink Sepolia</div>
              </button>
            ))}
          </div>
          <button onClick={()=>setStep(2)} style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,#fbbf24,#f97316)", border:"none", color:"black", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            Continue <ChevronRight size={16}/>
          </button>
        </div>}

        {/* Step 2: Price Ranges */}
        {step===2&&<div className="fu" style={card}>
          <h2 style={{ color:"white", fontWeight:700, fontSize:16, margin:"0 0 6px" }}>Price Ranges</h2>
          <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 16px" }}>Define 2-10 price ranges as outcomes</p>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:"#6b7280", fontSize:12, display:"block", marginBottom:6 }}>Market Question</label>
            <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder={`What will ${selectedFeed.label} price be at expiry?`}
              style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" as const }}/>
          </div>
          <button onClick={applyTemplate} style={{ marginBottom:14, padding:"7px 14px", borderRadius:9, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.2)", color:"#fbbf24", fontSize:12, cursor:"pointer", fontWeight:600 }}>
            ⚡ Auto-fill {selectedFeed.label} ranges
          </button>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:10, marginBottom:14 }}>
            {ranges.map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${COLORS[i%COLORS.length]}18`, border:`1px solid ${COLORS[i%COLORS.length]}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:COLORS[i%COLORS.length], fontSize:12, fontWeight:700 }}>{i+1}</span>
                </div>
                <input value={r} onChange={e=>setRanges(ranges.map((v,idx)=>idx===i?e.target.value:v))} placeholder={`Range ${i+1} (e.g. $2000-$3000)`}
                  style={{ flex:1, background:"rgba(0,0,0,0.3)", border:`1px solid ${r.trim()?COLORS[i%COLORS.length]+"40":"rgba(255,255,255,0.1)"}`, borderRadius:10, padding:"10px 14px", color:"white", fontSize:14, outline:"none", fontFamily:"inherit" }}/>
                {ranges.length > 2 && <button onClick={()=>setRanges(ranges.filter((_,idx)=>idx!==i))} style={{ width:28, height:28, borderRadius:8, background:"rgba(239,68,68,0.1)", border:"none", color:"#ef4444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={14}/>
                </button>}
              </div>
            ))}
          </div>
          {ranges.length < 10 && (
            <button onClick={()=>setRanges([...ranges,""])} style={{ width:"100%", padding:"10px", borderRadius:10, background:"rgba(251,191,36,0.06)", border:"1px dashed rgba(251,191,36,0.3)", color:"#fbbf24", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:14, fontWeight:600, marginBottom:16 }}>
              <Plus size={15}/>Add Range ({ranges.length}/10)
            </button>
          )}
          {error&&<div style={{ color:"#ef4444", fontSize:13, marginBottom:10, padding:"10px 14px", background:"rgba(239,68,68,0.1)", borderRadius:10 }}>{error}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <button onClick={()=>setStep(1)} style={{ padding:13, borderRadius:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#9ca3af", fontWeight:600, cursor:"pointer" }}>← Back</button>
            <button onClick={()=>{if(validRanges.length<2){setError("Add at least 2 ranges");return;}setError("");setStep(3);}}
              style={{ padding:13, borderRadius:12, background:"linear-gradient(135deg,#fbbf24,#f97316)", border:"none", color:"black", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              Continue <ChevronRight size={15}/>
            </button>
          </div>
        </div>}

        {/* Step 3: Duration */}
        {step===3&&<div className="fu" style={card}>
          <h2 style={{ color:"white", fontWeight:700, fontSize:16, margin:"0 0 16px" }}>Duration</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
            {DURATIONS.map(d=>(
              <button key={d.hours} onClick={()=>setDurationHours(d.hours)} style={{ padding:"16px 10px", borderRadius:14, border:durationHours===d.hours?"2px solid rgba(251,191,36,0.5)":"1px solid rgba(255,255,255,0.07)", background:durationHours===d.hours?"rgba(251,191,36,0.1)":"rgba(255,255,255,0.03)", cursor:"pointer", textAlign:"center" as const }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{d.icon}</div>
                <div style={{ color:durationHours===d.hours?"#fbbf24":"#9ca3af", fontSize:12, fontWeight:600 }}>{d.label}</div>
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <button onClick={()=>setStep(2)} style={{ padding:13, borderRadius:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#9ca3af", fontWeight:600, cursor:"pointer" }}>← Back</button>
            <button onClick={()=>setStep(4)} style={{ padding:13, borderRadius:12, background:"linear-gradient(135deg,#fbbf24,#f97316)", border:"none", color:"black", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>Review <ChevronRight size={15}/></button>
          </div>
        </div>}

        {/* Step 4: Deploy */}
        {step===4&&<div className="fu">
          <div style={{ ...card, marginBottom:14 }}>
            <h2 style={{ color:"white", fontWeight:700, fontSize:18, marginBottom:20 }}>Review & Deploy</h2>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
              <div style={{ padding:16, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ color:"#6b7280", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:8 }}>Question</p>
                <p style={{ color:"white", fontSize:15, fontWeight:600, margin:0 }}>{question}</p>
              </div>
              <div style={{ padding:16, borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ color:"#6b7280", fontSize:11, fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.08em", marginBottom:10 }}>Price Ranges ({validRanges.length})</p>
                <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8 }}>
                  {validRanges.map((r,i)=>(
                    <span key={i} style={{ padding:"4px 12px", borderRadius:99, fontSize:13, fontWeight:600, background:`${COLORS[i%COLORS.length]}18`, color:COLORS[i%COLORS.length] }}>{r}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.12)" }}>
                {[["Price Feed",selectedFeed.label+" (Chainlink)"],["Network","Sepolia Testnet"],["Fee","2%"],["Expires",new Date(Date.now()+durationHours*3600000).toLocaleDateString()]].map(([k,v],idx)=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginTop:idx>0?8:0, paddingTop:idx>0?8:0, borderTop:idx>0?"1px solid rgba(255,255,255,0.04)":"none" }}>
                    <span style={{ color:"#6b7280" }}>{k}</span><span style={{ color:"#fbbf24", fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {error&&<div style={{ color:"#ef4444", fontSize:13, marginBottom:12, padding:"12px 16px", background:"rgba(239,68,68,0.1)", borderRadius:12 }}>{error}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10 }}>
            <button onClick={()=>setStep(3)} style={{ padding:14, borderRadius:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#9ca3af", fontWeight:600, cursor:"pointer" }}>← Edit</button>
            <button onClick={handleSubmit} disabled={isPending||isConfirming}
              style={{ padding:14, borderRadius:12, background:isPending||isConfirming?"rgba(251,191,36,0.3)":"linear-gradient(135deg,#fbbf24,#f97316)", border:"none", color:"black", fontWeight:800, fontSize:16, cursor:isPending||isConfirming?"wait":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {isPending?"⏳ Confirm...":isConfirming?"⏳ Deploying...":"📊 Deploy Scalar Market"}
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}
