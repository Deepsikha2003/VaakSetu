export default function Demo({ runScenario }) {
  const scenarios = [
    {
      id: 1, name: 'The Language Bridge',
      icon: '🌉',
      description: 'A citizen calls speaking in Kannada dialect. VaakSetu transcribes, interprets, and speaks back a summary in Kannada. The citizen confirms the interpretation is correct.',
      language: 'Kannada (North Karnataka dialect)',
      expectedUtcs: '~150 (LOW)',
      color: 'var(--green)',
    },
    {
      id: 2, name: 'Keyword Emergency',
      icon: '🚨',
      description: 'A citizen calls in distress: "bachao bachao, wo mujhe maar raha hai!" Multiple Tier-1 emergency keywords are detected. UTCS instantly spikes to 750+. Dashboard flashes red, supervisor is alerted immediately.',
      language: 'Hindi (with code-mixing)',
      expectedUtcs: '~750 (CRITICAL)',
      color: 'var(--red)',
    },
    {
      id: 3, name: 'The Silent Emergency',
      icon: '🤫',
      description: 'A citizen calls but can barely speak. Background noise shows screaming and sounds of struggle. The system detects critical threat from noise alone — even without clear speech.',
      language: 'English (minimal speech)',
      expectedUtcs: '~620 (CRITICAL)',
      color: 'var(--purple)',
    },
  ]

  return (
    <div className="demo-page">
      <h1>DEMO SCENARIOS</h1>
      <p className="desc">
        These 3 scenarios demonstrate VaakSetu's full capability — from routine complaints to life-threatening emergencies. Click any scenario to run it live through the backend pipeline and see results on the Operations dashboard.
      </p>
      {scenarios.map(s => (
        <div key={s.id} className="scenario-card" onClick={() => runScenario(s.id)}>
          <div className="sc-tag">SCENARIO {s.id}</div>
          <h3>{s.icon} {s.name}</h3>
          <p>{s.description}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
              Language: <strong style={{ color: 'var(--blue)' }}>{s.language}</strong>
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
              Expected UTCS: <strong style={{ color: s.color }}>{s.expectedUtcs}</strong>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
