import { useState, useCallback } from 'react'

// Pre-seeded demo calls
const SEED_CALLS = [
  {
    call_id: 'CALL-001', caller_number: '+919876543210', agent_id: 'AGENT-001',
    language: 'kn', status: 'completed', started_at: '2026-05-04T10:15:00',
    utcs: { score: 145, level: 'LOW', color: '#22c55e' },
    summary: 'Road pothole complaint in Rajajinagar — 3 days unattended',
  },
  {
    call_id: 'CALL-002', caller_number: '+919876543211', agent_id: 'AGENT-002',
    language: 'hi', status: 'completed', started_at: '2026-05-04T11:30:00',
    utcs: { score: 720, level: 'CRITICAL', color: '#ef4444' },
    summary: 'Domestic violence emergency — citizen in immediate danger',
  },
  {
    call_id: 'CALL-003', caller_number: '+919876543212', agent_id: 'AGENT-001',
    language: 'en', status: 'completed', started_at: '2026-05-04T14:00:00',
    utcs: { score: 580, level: 'CRITICAL', color: '#ef4444' },
    summary: 'Silent emergency — background screaming detected',
  },
]

export function useCallState() {
  const [calls, setCalls] = useState(SEED_CALLS)
  const [activeCall, setActiveCall] = useState(null)
  const [latestResult, setLatestResult] = useState(null)

  const processResult = useCallback((result) => {
    if (!result) return
    const callEntry = {
      call_id: result.call_id,
      caller_number: 'Demo Call',
      agent_id: 'DEMO-AGENT',
      language: result.transcript?.language || 'en',
      status: 'active',
      started_at: result.timestamp || new Date().toISOString(),
      utcs: result.utcs || { score: 0, level: 'MINIMAL' },
      summary: result.nlp?.summary || '',
    }
    setCalls(prev => [callEntry, ...prev])
    setActiveCall(result)
    setLatestResult(result)
  }, [])

  const updateFromWS = useCallback((msg) => {
    if (!msg) return
    if (msg.type === 'processing_result' && msg.data) {
      processResult(msg.data)
    }
    if (msg.type === 'new_call' && msg.call) {
      setCalls(prev => [msg.call, ...prev])
    }
  }, [processResult])

  return { calls, activeCall, setActiveCall, latestResult, processResult, updateFromWS }
}
