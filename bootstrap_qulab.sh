#!/usr/bin/env bash
set -euo pipefail
mkdir -p qulab/backend/api/sim qulab/frontend/public qulab/frontend/src/{routes,widgets}
########################################
# BACKEND
########################################
cat > qulab/backend/requirements.txt <<'EOF'
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.8.2
sse-starlette==2.1.3
EOF

cat > qulab/backend/app.py <<'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.encoding import router as encoding_router
from api.governance import router as gov_router
from api.sim.teleport import router as teleport_router

app = FastAPI(title="QuLab API (Lite+Dummies)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health") 
def health(): return {"ok": True}

app.include_router(encoding_router, prefix="/encoding", tags=["encoding"])
app.include_router(gov_router, prefix="/governance", tags=["governance"])
app.include_router(teleport_router, prefix="/sim/teleport", tags=["teleport"])
EOF

cat > qulab/backend/api/__init__.py <<<''

cat > qulab/backend/api/encoding.py <<'EOF'
from fastapi import APIRouter
from pydantic import BaseModel
import math
router=APIRouter()
ASCII91="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_`{|}~"
def make_alphabet(base:int)->str:
    if base<2: raise ValueError("base>=2")
    if base<=len(ASCII91): return ASCII91[:base]
    raise ValueError("Lite alphabet supports up to base 91")
def _bytes_to_int(b:bytes)->int:
    n=0
    for x in b: n=(n<<8)|x
    return n
def encode_baseN(b:bytes, alpha:str)->str:
    if not b: return ""
    base=len(alpha); n=_bytes_to_int(b); out=[]
    while n>0: n, r = divmod(n, base); out.append(alpha[r])
    return "".join(reversed(out or [alpha[0]]))
def decode_baseN(s:str, alpha:str, out_len:int|None=None)->bytes:
    base=len(alpha); idx={c:i for i,c in enumerate(alpha)}; n=0
    for ch in s: n=n*base+idx[ch]
    if out_len is None:
        bits=math.ceil(len(s)*math.log2(base)); out_len=max(1,(bits+7)//8)
    raw=n.to_bytes(out_len,"big")
    return raw.lstrip(b"\x00") or b"\x00"
class EncodeReq(BaseModel): base:int; data_hex:str
class EncodeRes(BaseModel): base:int; bits_per_symbol:float; encoded:str
@router.post("/encode", response_model=EncodeRes)
def enc(req:EncodeReq):
    alpha=make_alphabet(req.base); data=bytes.fromhex(req.data_hex)
    return EncodeRes(base=req.base, bits_per_symbol=math.log2(req.base), encoded=encode_baseN(data, alpha))
class DecodeReq(BaseModel): base:int; encoded:str
class DecodeRes(BaseModel): data_hex:str
@router.post("/decode", response_model=DecodeRes)
def dec(req:DecodeReq):
    alpha=make_alphabet(req.base); out=decode_baseN(req.encoded, alpha)
    return DecodeRes(data_hex=out.hex())
EOF

cat > qulab/backend/api/governance.py <<'EOF'
from fastapi import APIRouter
from pydantic import BaseModel
import csv, os, time, random
router=APIRouter(); LEDGER="evidence_ledger.csv"
class Evidence(BaseModel): metric:str="fidelity"; value:float
@router.post("/add")
def add(ev:Evidence):
    exists=os.path.exists(LEDGER)
    with open(LEDGER,"a",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=["timestamp","metric","value"])
        if not exists: w.writeheader()
        w.writerow({"timestamp":time.strftime("%Y-%m-%d %H:%M:%S"),"metric":ev.metric,"value":ev.value})
    return {"ok":True}
class ForecastReq(BaseModel):
    alpha0:float=2.0; beta0:float=2.0; periods:int=12; events_per_period:int=3
    event_strength:float=0.6; outcome_mean:float=0.6; outcome_std:float=0.15
    profile:str="neutral"; runs:int=800
@router.post("/forecast")
def forecast(req:ForecastReq):
    drift={"optimistic":+0.01,"neutral":0.0,"pessimistic":-0.01}.get(req.profile,0.0)
    traj=[]
    for _ in range(req.runs):
        a,b=req.alpha0,req.beta0; means=[]
        for _ in range(req.periods):
            for _ in range(req.events_per_period):
                o=max(0,min(1,random.gauss(req.outcome_mean+drift,req.outcome_std)))
                s=max(0,min(1,req.event_strength)); a+=s*o; b+=s*(1-o)
            means.append(a/(a+b))
        traj.append(means)
    cols=list(zip(*traj))
    def q(c,p): return sorted(c)[max(0,min(len(c)-1,int(p*len(c))))]
    mean=[sum(c)/len(c) for c in cols]; lo=[q(c,0.05) for c in cols]; hi=[q(c,0.95) for c in cols]
    return {"trajectory_means":mean,"lo":lo,"hi":hi}
EOF

cat > qulab/backend/api/sim/__init__.py <<<''

cat > qulab/backend/api/sim/teleport.py <<'EOF'
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio, json, random
router=APIRouter()
@router.get("/run")
async def run():
    async def gen():
        for s in ["building","transpiling","running","analyzing"]:
            await asyncio.sleep(0.15); yield {"event":"status","data":s}
        counts={"00":random.randint(800,1200),"01":random.randint(300,600),"10":random.randint(300,600),"11":random.randint(0,120)}
        shots=sum(counts.values()); fidelity=round(0.995+random.random()*0.004,6)
        yield {"event":"result","data":json.dumps({"fidelity":fidelity,"counts":counts,"shots":shots})}
    return EventSourceResponse(gen())
EOF

########################################
# FRONTEND (Lite + Dummies Mode)
########################################
cat > qulab/frontend/package.json <<'EOF'
{
  "name": "qulab-ui-lite-dummies",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": { "react": "18.3.1", "react-dom": "18.3.1", "react-router-dom": "6.26.1" },
  "devDependencies": { "typescript": "5.5.4", "vite": "5.4.5", "@vitejs/plugin-react": "4.3.1", "@types/react": "18.3.3", "@types/react-dom": "18.3.0" }
}
EOF

cat > qulab/frontend/vite.config.ts <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins:[react()], server:{port:5173} });
EOF

cat > qulab/frontend/index.html <<'EOF'
<!doctype html><html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>QuLab (Lite + Dummies)</title>
<style>
body{margin:0;background:#0b0f15;color:#e6eef8;font:14px system-ui,Segoe UI,Roboto,sans-serif}
.nav{display:flex;gap:1rem;padding:12px;background:#0f1622;position:sticky;top:0}
.container{max-width:1100px;margin:0 auto;padding:12px}
.card{background:#111827;border:1px solid #1f2937;border-radius:12px;padding:12px}
.btn{background:#1e40af;color:#fff;border:0;padding:8px 12px;border-radius:8px;cursor:pointer}
.input,textarea{background:#0b1220;color:#e6eef8;border:1px solid #1f2937;border-radius:8px;padding:6px}
.pop{position:fixed;z-index:9999;max-width:280px;background:#0f172a;border:1px solid #334155;border-radius:10px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
.pop h4{margin:0 0 6px 0;font-size:13px}
.pop .tip{font-size:12px;opacity:.9}
.badge{background:#dc2626;color:#fff;border-radius:999px;padding:2px 8px;margin-left:6px;font-size:11px}
.logo{height:28px;vertical-align:middle;margin-right:8px}
</style>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
</body></html>
EOF

cat > qulab/frontend/public/logo.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff2a2a"/><stop offset="1" stop-color="#7a0f0f"/>
    </linearGradient>
  </defs>
  <!-- Safety goggles -->
  <rect x="20" y="30" rx="14" ry="14" width="120" height="60" fill="#0f172a" stroke="#93c5fd" stroke-width="6"/>
  <rect x="180" y="30" rx="14" ry="14" width="120" height="60" fill="#0f172a" stroke="#93c5fd" stroke-width="6"/>
  <rect x="140" y="50" width="40" height="20" fill="#93c5fd"/>
  <!-- Red paint splatter -->
  <circle cx="110" cy="25" r="8" fill="url(#g)"/>
  <circle cx="155" cy="20" r="5" fill="url(#g)"/>
  <circle cx="205" cy="25" r="9" fill="url(#g)"/>
  <path d="M60,15 q20,10 0,20 q-25,8 -10,25" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round"/>
  <!-- Fabric ripping / sparks -->
  <path d="M260,95 l10,12 l-20,0 z" fill="#fca5a5"/>
  <path d="M50,95 l-12,10 l24,0 z" fill="#fca5a5"/>
</svg>
EOF

cat > qulab/frontend/src/main.tsx <<'EOF'
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
createRoot(document.getElementById("root")!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
EOF

cat > qulab/frontend/src/App.tsx <<'EOF'
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Teleport from "./routes/Teleport";
import Encoding from "./routes/Encoding";
import Governance from "./routes/Governance";
import Help from "./widgets/Help";

export default function App(){
  return (
    <>
      <nav className="nav">
        <img src="/logo.svg" className="logo" alt="QuLab"/>
        <Link to="/teleport">Teleport</Link>
        <Link to="/encoding">Encoding</Link>
        <Link to="/governance">Governance</Link>
        <a href="http://localhost:8000/health" target="_blank">API</a>
        <Help/>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/teleport" />} />
          <Route path="/teleport" element={<Teleport/>} />
          <Route path="/encoding" element={<Encoding/>} />
          <Route path="/governance" element={<Governance/>} />
        </Routes>
      </div>
    </>
  );
}
EOF

# DUMMIES MODE OVERLAY (single button, context tips)
cat > qulab/frontend/src/widgets/Help.tsx <<'EOF'
import { useEffect, useState } from "react";

/** Simple Dummies Mode: click goggles to toggle popups pointing at key UI. */
export default function Help(){
  const [on,setOn]=useState(false);
  useEffect(()=>{
    const pop=(id:string, html:string, x:number, y:number)=>{
      const el=document.createElement("div"); el.className="pop"; el.id=id; el.style.left=x+"px"; el.style.top=y+"px";
      el.innerHTML=html; document.body.appendChild(el);
    };
    const kill=(id:string)=>{ const e=document.getElementById(id); if(e) e.remove(); };
    if(on){
      pop("pop-nav", `<h4>Navigation</h4><div class='tip'>Teleport, Encoding, Governance. Click to switch labs.</div>`, 12, 54);
      pop("pop-run", `<h4>Run Teleport</h4><div class='tip'>Press <b>Run (SSE)</b> to stream a result. In Pro/Lab, this calls Qiskit.</div>`, 320, 180);
      pop("pop-enc", `<h4>High-Radix</h4><div class='tip'>Pick a base (2..91 in Lite). Encode/Decode to test "fatter" signals.</div>`, 820, 110);
      pop("pop-gov", `<h4>Governance <span class='badge'>Chrono-Walker</span></h4><div class='tip'>Log fidelity, forecast bands, plan cadence.</div>`, 720, 58);
    } else {
      ["pop-nav","pop-run","pop-enc","pop-gov"].forEach(kill);
    }
    return ()=>{ ["pop-nav","pop-run","pop-enc","pop-gov"].forEach(kill); };
  },[on]);

  return (
    <button className="btn" title="Dummies Mode: on/off" onClick={()=>setOn(v=>!v)}>
      <span style={{marginRight:6}}>🕶️</span>{on?"Hide Tips":"Show Tips"}
    </button>
  );
}
EOF

cat > qulab/frontend/src/routes/Teleport.tsx <<'EOF'
import { useState } from "react";
import CircuitPane from "../widgets/CircuitPane";
import FidelityChart from "../widgets/FidelityChart";
type Result={fidelity:number; counts:Record<string,number>; shots:number};

export default function Teleport(){
  const [status,setStatus]=useState("idle"); const [result,setResult]=useState<Result|null>(null); const [running,setRunning]=useState(false);
  const run=()=>{
    setRunning(true); setStatus("connecting"); setResult(null);
    const sse=new EventSource("http://localhost:8000/sim/teleport/run");
    sse.addEventListener("status",(e:any)=>setStatus((e as MessageEvent).data));
    sse.addEventListener("result",(e:any)=>{ setResult(JSON.parse((e as MessageEvent).data)); setRunning(false); sse.close(); });
    sse.onerror=()=>{ setStatus("error"); setRunning(false); sse.close(); };
  };
  return (<div className="card">
    <h1>Teleportation Workspace <span className="badge">Lite</span></h1>
    <p>Build → Run → Inspect fidelity and counts. (Pro/Lab: Qiskit, tomography.)</p>
    <CircuitPane/>
    <div style={{display:"flex",gap:8,marginTop:8}}>
      <button className="btn" onClick={run} disabled={running}>{running?"Running...":"Run (SSE)"}</button>
      <span>Status: {status}</span>
    </div>
    {result && (<><h3 style={{marginTop:12}}>Result</h3><div>Fidelity: {result.fidelity}</div><FidelityChart counts={result.counts}/></>)}
  </div>);
}
EOF

cat > qulab/frontend/src/routes/Encoding.tsx <<'EOF'
import { useState } from "react";
export default function Encoding(){
  const [base,setBase]=useState(64); const [hex,setHex]=useState("48656c6c6f2051754c6162"); const [encoded,setEncoded]=useState(""); const [roundtrip,setRoundtrip]=useState("");
  const post=async (url:string, body:any)=> (await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})).json();
  return (<div className="card">
    <h1>High-Radix Encoding</h1>
    <div style={{display:"grid",gap:8,gridTemplateColumns:"1fr 1fr"}}>
      <div><label>Base (2..91): </label><input className="input" type="number" min={2} max={91} value={base} onChange={e=>setBase(parseInt(e.target.value||"64"))}/></div>
      <div><label>HEX:</label><textarea className="input" rows={3} value={hex} onChange={e=>setHex(e.target.value)} /></div>
    </div>
    <div style={{display:"flex",gap:8,marginTop:8}}>
      <button className="btn" onClick={async()=>{ const j=await post("http://localhost:8000/encoding/encode",{base,data_hex:hex}); setEncoded(j.encoded);}}>Encode</button>
      <button className="btn" onClick={async()=>{ const j=await post("http://localhost:8000/encoding/decode",{base,encoded}); setRoundtrip(j.data_hex);}} disabled={!encoded}>Decode</button>
    </div>
    <div style={{marginTop:12}}><b>Encoded:</b> {encoded}</div>
    <div><b>Roundtrip HEX:</b> {roundtrip}</div>
  </div>);
}
EOF

cat > qulab/frontend/src/routes/Governance.tsx <<'EOF'
import { useState } from "react";
export default function Governance(){
  const [value,setValue]=useState(0.9987); const [fc,setFc]=useState<{trajectory_means:number[],lo:number[],hi:number[]}|null>(null);
  const post=async (u:string,b:any)=> (await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)})).json();
  return (<div className="card">
    <h1>Governance (Chrono-Walker)</h1>
    <div style={{display:"flex",gap:8}}>
      <input className="input" type="number" step="0.0001" value={value} onChange={e=>setValue(parseFloat(e.target.value||"0"))}/>
      <button className="btn" onClick={async()=>{await post("http://localhost:8000/governance/add",{metric:"fidelity",value});}}>Add Evidence</button>
      <button className="btn" onClick={async()=>{setFc(await post("http://localhost:8000/governance/forecast",{}));}}>Forecast</button>
    </div>
    {fc && (<div style={{marginTop:12}}>
      <div><b>Mean:</b> {fc.trajectory_means.map(x=>x.toFixed(3)).join(", ")}</div>
      <div><b>5–95%:</b> {fc.lo.map(x=>x.toFixed(3)).join(", ")} … {fc.hi.map(x=>x.toFixed(3)).join(", ")}</div>
    </div>)}
  </div>);
}
EOF

cat > qulab/frontend/src/widgets/CircuitPane.tsx <<'EOF'
export default function CircuitPane(){
  return (
    <div className="card" style={{marginTop:8}}>
      <b>Circuit (schematic)</b>
      <pre style={{background:"#0b1220",padding:8,borderRadius:8,overflowX:"auto",marginTop:6}}>
{`q0: |ψ⟩  —■—H—M—     (Alice payload)
q1: |0⟩   —H—X—M—     (Alice EPR)
q2: |0⟩   ————■—(X/Z cond)——  (Bob EPR)`}
      </pre>
    </div>
  );
}
EOF

cat > qulab/frontend/src/widgets/FidelityChart.tsx <<'EOF'
export default function FidelityChart({counts}:{counts:Record<string,number>}){
  const entries=Object.entries(counts); const total=entries.reduce((a,[,v])=>a+v,0);
  return (<div className="card" style={{marginTop:8}}>
    <b>Counts</b>
    <div style={{display:"flex",gap:8,marginTop:6}}>
      {entries.map(([k,v])=>(
        <div key={k} title={`${k}: ${v}`}>
          <div style={{height:Math.max(8,(v/Math.max(1,total))*120),width:24,background:"#1e40af",borderRadius:4}}/>
          <div style={{textAlign:"center"}}>{k}</div>
        </div>
      ))}
    </div>
  </div>);
}
EOF

echo "QuLab scaffolded. Start backend and frontend as shown above."
