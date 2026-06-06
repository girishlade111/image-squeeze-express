import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional label shown in the error card (e.g. "Image Compressor"). */
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  chunkError?: boolean;
}

/**
 * Last-resort catch-all for rendering errors inside a route. Shows a friendly
 * recovery card with a "Try again" button and a "Go home" link, plus a
 * collapsible "Technical details" panel for self-diagnosis.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ''}]`, error, info);
    // Chunk-load errors happen when a lazy chunk's hash changed between
    // deploys and the browser still has the old HTML cached. The fix is
    // a hard reload — show a different copy in that case.
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      /Loading chunk \S+ failed/i.test(error.message) ||
      /Importing a module script failed/i.test(error.message);
    if (isChunkError) {
      this.setState({ chunkError: true });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h1 className="mt-4 text-center text-lg font-bold">Something went wrong</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {this.props.label
              ? `The ${this.props.label} hit an unexpected error.`
              : 'An unexpected error occurred.'}{' '}
            You can try again or head back to the home page.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={this.handleReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 text-xs font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Home className="h-3.5 w-3.5" />
              Go home
            </Link>
          </div>

          {this.state.error && (
            <details className="mt-4 rounded-lg border border-border/40 bg-foreground/[0.02] p-3 text-left">
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                Technical details
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[10px] text-muted-foreground/80">
                {this.state.error.name}: {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack?.split('\n').slice(0, 8).join('\n')}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
