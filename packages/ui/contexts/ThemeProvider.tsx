import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};
export const ThemeProvider = ({ children }: Props) => (
  <MantineProvider
    theme={{
      colorScheme: 'dark',
    }}
    withGlobalStyles
    withNormalizeCSS
  >
    {children}
  </MantineProvider>
);
