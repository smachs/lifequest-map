import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

type MyProps = {
  children: ReactNode;
};

type MyState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<MyProps, MyState> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <strong>Something went wrong.</strong>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
