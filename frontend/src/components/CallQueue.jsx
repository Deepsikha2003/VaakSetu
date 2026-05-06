export default function CallQueue({ calls, activeCall, onSelect }) {
  const lang = { kn: 'Kannada', hi: 'Hindi', en: 'English' }

  const getBadgeCls = (level) => {
    const l = (level || 'MINIMAL').toUpperCase()
    if (l === 'CRITICAL') return 'utcs-critical'
    if (l === 'HIGH') return 'utcs-high'
    if (l === 'MEDIUM') return 'utcs-warn'
    if (l === 'LOW') return 'utcs-safe'
    return 'utcs-safe'
  }

  const isCrit = (level) => (level || '').toUpperCase() === 'CRITICAL'

  return (
    <div>
      {calls.map(c => {
        const sel = activeCall?.call_id === c.call_id
        const level = c.utcs?.level || 'MINIMAL'
        return (
          <div key={c.call_id}
            className={`call-item ${sel ? 'active' : ''} ${isCrit(level) ? 'critical' : ''}`}
            onClick={() => onSelect(c)}>
            <div className="call-top">
              <div className="call-id">{c.call_id}</div>
              <div className={`utcs-badge ${getBadgeCls(level)}`}>{c.utcs?.score || 0}</div>
            </div>
            <div className="call-lang">{lang[c.language] || c.language || '?'} · {c.caller_number || 'Unknown'}</div>
            <div className="call-preview">{(c.summary || 'Processing...').substring(0, 60)}{c.summary?.length > 60 ? '…' : ''}</div>
          </div>
        )
      })}
    </div>
  )
}
