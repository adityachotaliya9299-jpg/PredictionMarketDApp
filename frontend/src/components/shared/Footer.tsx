"use client";
import Link from "next/link";
import { TrendingUp, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.07)", background:"#0a0a0f", marginTop:64, clear:"both" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:32 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#22d3ee,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <TrendingUp size={14} color="black" strokeWidth={2.5}/>
              </div>
              <span style={{ fontWeight:700, fontFamily:"monospace", color:"white" }}>Predict<span style={{color:"#22d3ee"}}>X</span></span>
            </div>
            <p style={{ color:"#6b7280", fontSize:12, lineHeight:1.6, maxWidth:200 }}>Decentralized prediction markets powered by smart contracts and trustless oracles.</p>
          </div>
          <div>
            <p style={{ color:"#9ca3af", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Platform</p>
            {[{href:"/",label:"Browse Markets"},{href:"/create",label:"Create Market"},{href:"/portfolio",label:"My Portfolio"}].map(({href,label})=>(
              <Link key={href} href={href} style={{ display:"block", color:"#6b7280", fontSize:14, textDecoration:"none", marginBottom:8 }}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ color:"#9ca3af", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Contracts (Sepolia)</p>
            {[
              {label:"MarketFactory",href:`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_FACTORY_ADDRESS}`},
              {label:"MockOracle",href:`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_ORACLE_ADDRESS}`},
            ].map(({label,href})=>(
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:6, color:"#6b7280", fontSize:14, textDecoration:"none", marginBottom:8 }}>
                <ExternalLink size={12}/>{label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", marginTop:32, paddingTop:24, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <p style={{ color:"#4b5563", fontSize:12 }}>© {new Date().getFullYear()} PredictX. All rights reserved.</p>
          <a href="https://portfolio-one-bice-xqt0376aiu.vercel.app/" target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none", fontSize:13, fontFamily:"monospace" }}>
            <span style={{ color:"#6b7280" }}>Built by</span>
            <span style={{ fontWeight:700, letterSpacing:"0.05em" }}>
              {"ADITYA CHOTALIYA".split("").map((char,i)=>(
                <span key={i} style={{ color:char===" "?"transparent":`hsl(${i*22%360},80%,60%)`, textShadow:char!==" "?`0 0 10px hsl(${i*22%360},80%,60%)`:"none" }}>
                  {char===" "?"\u00A0":char}
                </span>
              ))}
            </span>
            <ExternalLink size={12} color="#6b7280"/>
          </a>
        </div>
      </div>
    </footer>
  );
}
