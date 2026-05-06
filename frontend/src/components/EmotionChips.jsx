export default function EmotionChips({ emotion }) {
  const em = emotion || {}
  const chips = [
    { key: 'calm', label: 'CALM' },
    { key: 'distress', label: 'DISTRESS' },
    { key: 'fear', label: 'FEAR' },
    { key: 'panic', label: 'PANIC' },
    { key: 'urgent', label: 'URGENT' },
    { key: 'confused', label: 'CONFUSED' },
  ]

  const isActive = (key) => {
    const val = em[key] || 0
    if (key === 'calm') return val > 0.5
    if (key === 'urgent') return (em.panic || 0) > 0.7
    return val > 0.3
  }

  return (
    <div className="section">
      <div className="section-hdr">Emotion State</div>
      <div className="emotion-grid">
        {chips.map(c => (
          <div key={c.key} className={`chip ${isActive(c.key) ? `on-${c.key}` : ''}`}>{c.label}</div>
        ))}
      </div>
    </div>
  )
}
