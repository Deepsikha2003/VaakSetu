import { useState } from 'react'

export default function AIInterpretation({ data }) {
  const nlp = data?.nlp || {}
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')

  const fields = [
    { k:'intent', l:'Intent', v:nlp.intent?`${nlp.intent.category} → ${nlp.intent.subcategory}`:'Unknown', i:'🎯' },
    { k:'summary', l:'Summary', v:nlp.summary||'Processing...', i:'📝' },
    { k:'urgency', l:'Urgency', v:nlp.urgency||'unknown', i:'⚡' },
    { k:'location', l:'Location', v:nlp.entities?.location||'Unknown', i:'📍' },
    { k:'action', l:'Suggested Action', v:nlp.suggested_action||'Pending...', i:'🔧' },
    { k:'sentiment', l:'Sentiment', v:nlp.sentiment?.overall||'neutral', i:'💭' },
  ]

  const uColors = { critical:'var(--red)', high:'var(--orange)', medium:'var(--yellow)', low:'var(--green)' }

  return (
    <div className="ai-box">
      <h3>🤖 AI Interpretation <span style={{fontSize:'.5rem',color:'var(--text3)',marginLeft:'auto',fontWeight:400}}>Claude API • Editable</span></h3>
      {fields.map(f => (
        <div key={f.k} className="ai-field">
          <div className="ai-label">{f.i} {f.l}</div>
          <div className="ai-val" onClick={()=>{setEditing(f.k);setEditVal(f.v)}} title="Click to edit">
            {editing===f.k ? (
              <input value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>setEditing(null)} onKeyDown={e=>e.key==='Enter'&&setEditing(null)} autoFocus/>
            ) : (
              <span style={f.k==='urgency'?{color:uColors[f.v]||'inherit',fontWeight:700,textTransform:'uppercase'}:{}}>{f.v}</span>
            )}
          </div>
        </div>
      ))}
      {nlp.intent?.confidence && (
        <div style={{marginTop:6,fontSize:'.6rem',color:'var(--text3)',textAlign:'right'}}>
          Confidence: <span style={{fontFamily:'var(--mono)',color:'var(--emerald)'}}>{(nlp.intent.confidence*100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  )
}
