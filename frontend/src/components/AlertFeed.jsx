export default function AlertFeed({ data }) {
  const utcs = data?.utcs, kw = data?.keywords, ns = data?.noise_analysis
  const alerts = []
  if (utcs?.level === 'CRITICAL') alerts.push({ color: 'red', text: `CRITICAL — UTCS: ${utcs.score}` })
  if (utcs?.level === 'HIGH') alerts.push({ color: 'yellow', text: `HIGH PRIORITY — UTCS: ${utcs.score}` })
  if (kw?.severity === 'CRITICAL') alerts.push({ color: 'red', text: `Tier-1 keywords: ${kw.tier_counts?.[1] || 0} hits` })
  if (ns?.is_threat) alerts.push({ color: 'red', text: `Background: ${ns.dominant_type?.toUpperCase()} (${Math.round((ns.confidence || 0) * 100)}%)` })
  if (data?.nlp?.urgency === 'critical') alerts.push({ color: 'yellow', text: 'NLP: Emergency intent detected' })

  return (
    <div className="section">
      <div className="section-hdr">Alert Feed</div>
      {alerts.length === 0 ? (
        <div style={{ padding: '12px 14px', textAlign: 'center', fontSize: '10px', color: 'var(--muted)' }}>No active alerts</div>
      ) : alerts.map((a, i) => (
        <div key={i} className="alert-item">
          <div className={`alert-dot alert-${a.color}`}></div>
          <div className="alert-text">{a.text}</div>
        </div>
      ))}
    </div>
  )
}
