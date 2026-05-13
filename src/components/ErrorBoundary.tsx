import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[커넥션스] 오류 발생:", error, info.componentStack);
  }

  handleReset = () => {
    // localStorage 손상 가능성 대비 — 게임 상태만 초기화
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith("connections-") && !key.includes("stats") && !key.includes("colorblind") && !key.includes("tutorial")) {
          localStorage.removeItem(key!);
        }
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="error-boundary">
        <p className="error-emoji">😵</p>
        <h2 className="error-title">앗, 문제가 생겼어요</h2>
        <p className="error-desc">
          일시적인 오류가 발생했어요.
          <br />
          아래 버튼을 눌러 다시 시도해 주세요.
        </p>
        <button className="error-retry-btn" onClick={this.handleReset}>
          다시 시도
        </button>
      </div>
    );
  }
}
