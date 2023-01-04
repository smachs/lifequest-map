import { Anchor, Loader, MantineProvider, TextInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import shallow from 'zustand/shallow';
import { fetchJSON } from '../../utils/api';
import { useUserStore } from '../../utils/userStore';
import AcceptAction from '../AcceptAction/AcceptAction';

const submitSupporterSecret = (supporterSecret: string) =>
  fetchJSON('/api/auth/account', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ supporterSecret }),
  });

const SupporterInput = () => {
  const { account, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );
  const mutation = useMutation(submitSupporterSecret, {
    onSuccess: refreshAccount,
  });
  const [secret, setSecret] = useState('');

  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
      }}
    >
      <TextInput
        disabled={!account || account.isSupporter}
        label="Supporter Secret"
        description={
          account?.isSupporter ? (
            'You are already a supporter ❤'
          ) : (
            <>
              Become a supporter on{' '}
              <Anchor href="https://www.patreon.com/devleon" target="_blank">
                Patreon
              </Anchor>{' '}
              to disable ads and get the Discord supporter role 🤘
            </>
          )
        }
        placeholder="Enter your secret"
        error={(mutation.error as Error)?.message}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && secret) {
            mutation.mutate(secret);
          }
        }}
        rightSection={
          mutation.isLoading ? (
            <Loader size="xs" />
          ) : (
            <AcceptAction
              onAccept={() => mutation.mutate(secret)}
              disabled={!secret}
              ariaLabel="Save supporter secret"
            />
          )
        }
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
      />
    </MantineProvider>
  );
};

export default SupporterInput;
