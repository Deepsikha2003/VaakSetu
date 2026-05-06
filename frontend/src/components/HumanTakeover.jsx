import { useState } from 'react'

export default function HumanTakeover({ utcs, callId }) {
  const [taken, setTaken] = useState(false)
  const isCrit = utcs?.level==='CRITICAL'||utcs?.level==='HIGH'

  if (taken) {
    return (
      <div style={{padding:16,borderRadius:'var(--r)',textAlign:'center',background:'rgba(239,68,68,.08)',border:'2px solid rgba(239,68,68,.3)'}}>
        <div style={{fontSize:'1.8rem',marginBottom:6}}>🔴</div>
        <div style={{fontWeight:800,fontSize:'.95rem',color:'var(--red)'}}>HUMAN TAKEOVER ACTIVE</div>
        <div style={{fontSize:'.65rem',color:'var(--text3)',marginTop:4}}>AI stepped back. Agent controlling call {callId}.</div>
      </div>
    )
  }

  return (
    <button className="btn-takeover" onClick={()=>setTaken(true)}
      style={!isCrit?{opacity:.4,background:'var(--card)',border:'1px solid var(--border)',boxShadow:'none',color:'var(--text3)'}:{}}>
      🔴 TAKE OVER CALL
      {isCrit&&<span style={{display:'block',fontSize:'.6rem',fontWeight:400,marginTop:2}}>⚠ UTCS {utcs?.level} — Takeover recommended</span>}
    </button>
  )
}
