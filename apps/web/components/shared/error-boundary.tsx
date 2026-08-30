'use client';

import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state py-12">
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Algo deu errado.</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-2 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
