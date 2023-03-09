import { Button, CopyButton, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { Component } from 'react';

type MyProps = {
  children: ReactNode;
};

type MyState = {
  error: null | Error;
};

class ErrorBoundary extends Component<MyProps, MyState> {
  state: MyState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error: error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <Stack>
          <Text weight={500}>
            Something went wrong.
            <br />
            {this.state.error.message}
          </Text>
          <CopyButton
            value={JSON.stringify({
              name: this.state.error.name,
              message: this.state.error.message,
              stack: this.state.error.stack,
            })}
          >
            {({ copied, copy }) => (
              <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                {copied ? 'Copied 🤘' : 'Copy error message'}
              </Button>
            )}
          </CopyButton>
        </Stack>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
