import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('VaakSetu UI Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-mono)',
          padding: '40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--red)', letterSpacing: '3px', marginBottom: '12px' }}>
            SYSTEM ERROR
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--muted)', maxWidth: '500px', lineHeight: '1.6', marginBottom: '20px' }}>
            VaakSetu encountered an unexpected error. This doesn't affect the backend pipeline — all calls are still being processed.
          </p>
          <pre style={{
            fontSize: '10px', color: 'var(--orange)', background: 'var(--surface)', padding: '16px',
            borderRadius: '6px', border: '1px solid var(--border)', maxWidth: '600px', overflow: 'auto',
            textAlign: 'left', marginBottom: '20px',
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '10px 24px', border: '1px solid var(--accent)',
              background: 'var(--green-dim)', color: 'var(--accent)', cursor: 'pointer', borderRadius: '3px',
              letterSpacing: '1px',
            }}
          >
            ↻ RESTART DASHBOARD
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
