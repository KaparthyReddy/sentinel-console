import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import { Notice } from './Notice';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Catches render errors so one broken component can't blank the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container stack" style={undefined}>
        <Notice tone="error" title="Something went wrong">
          An unexpected error occurred. Reloading the page usually fixes it.
        </Notice>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}
