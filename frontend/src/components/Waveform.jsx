export default function Waveform({ active }) {
  const bars = Array.from({ length: 40 }, (_, i) => ({
    height: Math.random() * 24 + 6,
    delay: Math.random() * 0.8,
    dur: 0.5 + Math.random() * 0.6,
  }))

  return (
    <div className="waveform">
      {bars.map((b, i) => (
        <div key={i} className="wave-bar" style={{
          height: `${b.height}px`,
          animationDelay: `${b.delay}s`,
          animationDuration: `${b.dur}s`,
          opacity: active ? 0.7 : 0.15,
          animationPlayState: active ? 'running' : 'paused',
        }} />
      ))}
    </div>
  )
}
