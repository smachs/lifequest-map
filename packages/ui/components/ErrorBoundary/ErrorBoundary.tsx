import type { ReactNode } from 'react';
import { Component } from 'react';
import { writeError } from '../../utils/logs';

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

  componentDidCatch(error: Error) {
    writeError(error);
  }

  render() {
    if (this.state.hasError) {
      return <strong>Something went wrong.</strong>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
