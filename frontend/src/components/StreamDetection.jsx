export default function StreamDetection({ data, kwPct = 0, emPct = 0, noisePct = 0, threatPct = 0 }) {
  return (
    <div className="section">
      <div className="section-hdr">Signal Detection</div>
      <div className="stream-row">
        <div className="stream-label"><span>Keyword Density</span><span>{kwPct}%</span></div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${kwPct}%`, background: 'var(--blue)' }}></div></div>
      </div>
      <div className="stream-row">
        <div className="stream-label"><span>Noise Risk</span><span>{noisePct}%</span></div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${noisePct}%`, background: 'var(--orange)' }}></div></div>
      </div>
      <div className="stream-row">
        <div className="stream-label"><span>Emotional Intensity</span><span>{emPct}%</span></div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${emPct}%`, background: 'var(--yellow)' }}></div></div>
      </div>
      <div className="stream-row">
        <div className="stream-label"><span>Threat Level</span><span>{threatPct}%</span></div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${threatPct}%`, background: 'var(--red)' }}></div></div>
      </div>

      {/* Keywords */}
      {data?.keywords?.hits?.length > 0 && (
        <div style={{ padding: '8px 14px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {data.keywords.hits.map((h, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '2px 6px', borderRadius: '2px',
              background: h.tier === 1 ? 'var(--red-dim)' : h.tier === 2 ? 'var(--orange-dim)' : 'var(--yellow-dim)',
              color: h.tier === 1 ? 'var(--red)' : h.tier === 2 ? 'var(--orange)' : 'var(--yellow)',
              border: `1px solid ${h.tier === 1 ? 'rgba(255,23,68,0.3)' : h.tier === 2 ? 'rgba(255,109,0,0.3)' : 'rgba(255,214,0,0.3)'}`,
            }}>{h.keyword} T{h.tier}</span>
          ))}
        </div>
      )}
    </div>
  )
}
