import { Anchor, Text } from '@mantine/core';

type CreditProps = {
  username: string;
};

function Credit({ username }: CreditProps): JSX.Element {
  let content: JSX.Element;
  if (username === 'mapgenie') {
    content = (
      <Anchor
        href="https://mapgenie.io/new-world/maps/aeternum"
        target="_blank"
      >
        Map Genie
      </Anchor>
    );
  } else if (username === 'newworld-map') {
    content = (
      <Anchor href="https://www.newworld-map.com" target="_blank">
        New World Map
      </Anchor>
    );
  } else if (username === 'nwdb') {
    content = (
      <Anchor href="https://nwdb.info/" target="_blank">
        NWDB
      </Anchor>
    );
  } else {
    content = (
      <Text component="span" weight="bold">
        {username}
      </Text>
    );
  }
  return (
    <Text component="span" size="xs">
      by {content} ❤️
    </Text>
  );
}

export default Credit;
