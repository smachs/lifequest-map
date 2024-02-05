import { Button, Text } from '@mantine/core';
import Cookies from 'js-cookie';
import { useAccountStore } from '../../utils/account';

const SupporterInput = () => {
  const accountStore = useAccountStore();

  return (
    <>
      {!accountStore.isPatron ? (
        <>
          <Text italic align="center">
            Join us in creating an ad-free haven for our community.
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
              Cookies.remove('userId');
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
