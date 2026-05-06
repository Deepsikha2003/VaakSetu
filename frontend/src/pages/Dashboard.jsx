import CallQueue from '../components/CallQueue'
import UTCSDisplay from '../components/UTCSDisplay'
import StreamDetection from '../components/StreamDetection'
import LiveTranscript from '../components/LiveTranscript'
import AIInterpretation from '../components/AIInterpretation'
import VerificationLoop from '../components/VerificationLoop'
import HumanTakeover from '../components/HumanTakeover'
import MapView from '../components/MapView'
import AlertFeed from '../components/AlertFeed'
import EventLog from '../components/EventLog'
import TechStack from '../components/TechStack'

export default function Dashboard({ calls, activeCall, setActiveCall, connected, runScenario }) {
  const data = activeCall || null
  const utcs = data?.utcs || { score: 0, level: 'MINIMAL', color: '#3b82f6' }

  return (
    <div className="dash">
      {/* LEFT — Call Queue */}
      <div className="col">
        <div className="col-head">
          <span className="col-title">📞 Incoming Calls</span>
          <span style={{fontSize:'.6rem',color:'var(--text3)'}}>{calls.length}</span>
        </div>
        <div className="col-body">
          <button className="btn-scenario btn-s1" onClick={()=>runScenario(1)}>▶ 1 — Language Bridge (Kannada)</button>
          <button className="btn-scenario btn-s2" onClick={()=>runScenario(2)}>▶ 2 — Keyword Emergency (Hindi)</button>
          <button className="btn-scenario btn-s3" onClick={()=>runScenario(3)}>▶ 3 — Silent Emergency</button>
          <div style={{height:1,background:'var(--border)',margin:'8px 0'}}/>
          <CallQueue calls={calls} activeCall={data} onSelect={setActiveCall} />
        </div>
      </div>

      {/* CENTER — Processing */}
      <div className="col">
        <div className="col-head">
          <span className="col-title">🔬 Call Analysis {data ? `— ${data.call_id}` : ''}</span>
          {data && <span className={`utcs ${utcs.level==='CRITICAL'?'c':utcs.level==='HIGH'?'h':utcs.level==='MEDIUM'?'m':utcs.level==='LOW'?'l':'n'}`}>{utcs.score}</span>}
        </div>
        <div className="col-body">
          {data ? (
            <>
              <UTCSDisplay utcs={utcs} />
              <MapView data={data} />
              <StreamDetection data={data} />
              <LiveTranscript data={data} />
              <AIInterpretation data={data} />
              <VerificationLoop data={data} />
              <HumanTakeover utcs={utcs} callId={data.call_id} />
            </>
          ) : (
            <div className="empty">
              <div className="icon">🌉</div>
              <div className="title">VaakSetu Operations Center</div>
              <div className="sub">Select a call or run a demo scenario to begin analysis</div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Intelligence Feed */}
      <div className="col">
        <div className="col-head">
          <span className="col-title">📡 Intelligence Feed</span>
          <span className={`status-pill ${connected?'live':''}`} style={{padding:'2px 8px',fontSize:'.55rem'}}>
            <span className="dot" style={connected?{}:{background:'#ef4444'}}/>
            {connected?'LIVE':'OFF'}
          </span>
        </div>
        <div className="col-body">
          <AlertFeed data={data} />
          <EventLog calls={calls} />
          <TechStack />
        </div>
      </div>
    </div>
  )
}
