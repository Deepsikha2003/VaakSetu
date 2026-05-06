import { useTypingAnimation } from '../hooks/useTypingAnimation'

export default function LiveTranscript({ data }) {
  const text = data?.transcript?.text || ''
  const lang = data?.transcript?.language || 'auto'
  const latency = data?.transcript?.asr_latency_ms || 0
  const { displayText, isTyping } = useTypingAnimation(text, 20)
  const langMap = { kn: 'ಕನ್ನಡ Kannada', hi: 'हिंदी Hindi', en: 'English' }

  if (!data) {
    return (
      <div className="transcript-area">
        <div className="empty-state">
          <div className="icon">🌉</div>
          <div className="title">Select a demo scenario or wait for live call</div>
        </div>
      </div>
    )
  }

  return (
    <div className="transcript-area">
      {/* Citizen line */}
      <div className="transcript-line t-citizen">
        <div className="t-label">CITIZEN</div>
        <div style={{ flex: 1 }}>
          <div className="t-text">
            {displayText || '…'}
            {isTyping && <span className="cursor-blink" />}
          </div>
          {lang && <div className="t-extra">🌐 {langMap[lang] || lang} · ASR latency: {latency}ms</div>}
        </div>
        <div className="t-timestamp">{data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}</div>
      </div>

      {/* System analysis line */}
      {data.keywords?.hits?.length > 0 && (
        <div className="transcript-line t-system">
          <div className="t-label">SYSTEM</div>
          <div style={{ flex: 1 }}>
            <div className="t-text">
              ⚡ KEYWORD ALERT: {data.keywords.hits.map(h => `"${h.keyword}" (Tier-${h.tier})`).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* AI summary line */}
      {data.nlp?.summary && !isTyping && (
        <div className="transcript-line t-agent" style={{ animationDelay: '0.5s' }}>
          <div className="t-label">AI-NLP</div>
          <div style={{ flex: 1 }}>
            <div className="t-text">{data.nlp.summary}</div>
            {data.nlp.suggested_action && (
              <div className="t-extra">→ Suggested: {data.nlp.suggested_action}</div>
            )}
          </div>
        </div>
      )}

      {/* Noise analysis line */}
      {data.noise_analysis?.is_threat && (
        <div className="transcript-line t-system">
          <div className="t-label">NOISE</div>
          <div style={{ flex: 1 }}>
            <div className="t-text" style={{ color: 'var(--red)' }}>
              🔊 Background: {data.noise_analysis.dominant_type?.toUpperCase()} detected ({Math.round((data.noise_analysis.confidence || 0) * 100)}% confidence)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
