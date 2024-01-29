import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';

const queryClient = new QueryClient();
broadcastQueryClient({
  queryClient,
  broadcastChannel: 'aeternum-map',
});

type Props = {
  children: ReactNode;
};
const ProviderHell = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MarkersProvider>{children}</MarkersProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default ProviderHell;
