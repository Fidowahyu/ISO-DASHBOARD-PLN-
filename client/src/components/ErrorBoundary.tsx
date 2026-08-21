import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  requestId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in a structured way (picked up by JSON logger in production)
    const entry = {
      level: 'error',
      service: 'iso30414-ui',
      message: 'React ErrorBoundary caught an error',
      error: error.message,
      componentStack: info.componentStack?.slice(0, 500),
    };
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0f0f14',
          padding: 24,
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 64,
            marginBottom: 16,
            filter: 'grayscale(0.3)',
          }}
        >
          ⚠️
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f1f5f9',
            margin: '0 0 12px',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: '#64748b',
            maxWidth: 400,
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          An unexpected error occurred. Please refresh the page or go back to the dashboard.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
          <button
            onClick={() => { window.location.href = '/dashboard'; }}
            style={{
              padding: '10px 24px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              color: '#94a3b8',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
}
