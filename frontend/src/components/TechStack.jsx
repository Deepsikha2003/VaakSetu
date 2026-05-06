export default function TechStack() {
  const stack = ['Whisper API', 'Claude API', 'FastAPI', 'WebSocket', 'librosa', 'gTTS', 'Twilio', 'SQLite', 'React', 'Leaflet', 'Docker']
  return (
    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--muted)', marginBottom: '6px', letterSpacing: '1px' }}>TECH STACK</div>
      <div className="tech-stack">
        {stack.map(t => <div key={t} className="tech-chip">{t}</div>)}
      </div>
    </div>
  )
}
