export default function EventLog({ calls }) {
  const evts = calls.map(c => ({
    time: c.started_at ? new Date(c.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    msg: `${c.call_id}: ${(c.summary || 'Processing...').substring(0, 45)}`,
    sev: (c.utcs?.level || 'minimal').toLowerCase(),
  })).slice(0, 15)

  return (
    <div className="section">
      <div className="section-hdr">System Event Log</div>
      <div className="event-log">
        {evts.map((e, i) => (
          <div key={i}>
            <span className={e.sev === 'critical' ? 'ev-red' : 'ev-blue'}>[{e.time}]</span> {e.msg}
          </div>
        ))}
        {evts.length === 0 && <div>No events yet</div>}
      </div>
    </div>
  )
}
