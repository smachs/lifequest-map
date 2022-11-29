import { Group, Image, Title } from '@mantine/core';

const AppTitle = () => {
  return (
    <Group spacing="xs">
      <Image src="/icon.png" alt="" height={28} width={28} />
      <Title order={1} size="md">
        Aeternum-Map.gg
      </Title>
    </Group>
  );
};

export default AppTitle;
