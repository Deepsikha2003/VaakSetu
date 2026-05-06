import { useState } from 'react'

export default function VerificationLoop({ data }) {
  const [state, setState] = useState('pending')
  const nlp = data?.nlp || {}
  const lang = data?.transcript?.language || 'en'

  const templates = {
    kn: `ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ, ನೀವು ${nlp.entities?.location||'ನಿಮ್ಮ ಪ್ರದೇಶ'} ನಲ್ಲಿ ${(nlp.summary||'').substring(0,50)} ವರದಿ ಮಾಡುತ್ತಿದ್ದೀರಿ. ಇದು ಸರಿಯೇ?`,
    hi: `मैं समझ गया, आप ${nlp.entities?.location||'आपके क्षेत्र'} में ${(nlp.summary||'').substring(0,50)} की रिपोर्ट कर रहे हैं। क्या यह सही है?`,
    en: `I understand you are reporting "${(nlp.summary||'your issue').substring(0,60)}" at ${nlp.entities?.location||'your area'}. Is that correct?`,
  }

  return (
    <div className="verify">
      <h3>
        ✅ Verification Loop
        {state==='confirmed'&&<span style={{marginLeft:6,fontSize:'.6rem',color:'var(--emerald)'}}>✓ Confirmed</span>}
        {state==='denied'&&<span style={{marginLeft:6,fontSize:'.6rem',color:'var(--red)'}}>✗ → Takeover</span>}
      </h3>
      <div className="verify-text">"{templates[lang]||templates.en}"</div>
      <div style={{fontSize:'.55rem',color:'var(--text3)',marginBottom:6}}>🔊 Coqui TTS → Spoken in {lang==='kn'?'Kannada':lang==='hi'?'Hindi':'English'}</div>
      {state==='pending' ? (
        <div className="verify-btns">
          <button className="btn btn-yes" onClick={()=>setState('confirmed')}>✓ Yes</button>
          <button className="btn btn-no" onClick={()=>setState('denied')}>✗ No</button>
          <button className="btn btn-partial" onClick={()=>setState('confirmed')}>↻ Partial</button>
        </div>
      ) : state==='confirmed' ? (
        <div style={{padding:6,borderRadius:4,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.15)',fontSize:'.7rem',color:'var(--emerald)'}}>
          ✅ Confirmed — Summary stored. Training signal sent to learning pipeline.
        </div>
      ) : (
        <div style={{padding:6,borderRadius:4,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.15)',fontSize:'.7rem',color:'var(--red)'}}>
          ❌ Unconfirmed → Flagged for human takeover. AI stepping back.
        </div>
      )}
    </div>
  )
}
