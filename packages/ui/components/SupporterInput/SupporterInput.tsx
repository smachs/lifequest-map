import { Button, Text } from '@mantine/core';
import { useAccountStore } from '../../utils/account';

const SupporterInput = () => {
  const accountStore = useAccountStore();

  return (
    <>
      {!accountStore.isPatron ? (
        <>
          <Text italic align="center">
            Get rid of ads and support me on Patreon
          </Text>
          <Button
            component="a"
            href="https://www.th.gl/support-me"
            target="_blank"
            color="orange"
          >
            Become a Patron
          </Button>
        </>
      ) : (
        <>
          <Button
            color="orange"
            onClick={() => {
              accountStore.setIsPatron(false);
            }}
          >
            Disconnect your Patreon account
          </Button>
        </>
      )}
    </>
  );
};

export default SupporterInput;
