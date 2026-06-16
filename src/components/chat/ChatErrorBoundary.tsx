"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChatErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[Orby] UI crash:", error.message);
    // Report to server in production for Vercel Function logs
    if (process.env.NODE_ENV === "production") {
      fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack?.slice(0, 1000),
          component: "PortfolioLab",
        }),
      }).catch(() => {});
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 text-sm px-4 text-center">
          <p>Orby hit an error. Refresh to try again.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="text-violet-400 underline hover:text-violet-300 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
