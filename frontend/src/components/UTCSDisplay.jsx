import { useState, useEffect } from 'react'

export default function UTCSDisplay({ utcs }) {
  const [anim, setAnim] = useState(0)
  const score = utcs?.score || 0
  const level = utcs?.level || 'MINIMAL'
  const color = utcs?.color || '#3b82f6'
  const bd = utcs?.breakdown || {}

  useEffect(() => {
    const start = anim; const diff = score - start
    const t0 = performance.now()
    const run = (t) => {
      const p = Math.min((t-t0)/800,1)
      setAnim(Math.round(start + diff * (1-Math.pow(1-p,3))))
      if (p<1) requestAnimationFrame(run)
    }
    requestAnimationFrame(run)
  }, [score])

  const isCrit = level === 'CRITICAL'
  const actionColor = isCrit ? 'rgba(239,68,68,.1)' : 'rgba(37,99,235,.08)'
  const actionTextColor = isCrit ? 'var(--red)' : 'var(--gov-accent)'

  return (
    <div className={`utcs-big ${isCrit?'crit':''}`}>
      <div className="label">Unified Threat Confidence Score</div>
      <div className="num" style={{color}}>{anim}</div>
      <div className="level" style={{color}}>{level}</div>
      <div className="breakdown">
        {Object.entries(bd).map(([k,v]) => (
          <div key={k} className="bd-item">
            <div className="bd-row"><span className="bd-label">{k}</span><span className="bd-val">{v}</span></div>
            <div className="bd-bar"><div className="bd-fill" style={{width:`${Math.min(100,(v/Math.max(score,1))*100)}%`,background:color}}/></div>
          </div>
        ))}
      </div>
      {utcs?.action && (
        <div className="action-tag" style={{background:actionColor,color:actionTextColor}}>
          {utcs.action.replace(/_/g,' ')}
        </div>
      )}
    </div>
  )
}
