import { Anchor, Group, Paper } from '@mantine/core';

function Footer() {
  return (
    <Paper component="footer" radius={0} p={1}>
      <Group spacing="xs">
        <Anchor
          size="xs"
          href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
          title="Aeternum Map Companion"
          target="_blank"
        >
          Overwolf App
        </Anchor>
        <Anchor
          size="xs"
          href="https://www.arkesia.gg/"
          title="Interactive map for Lost Ark"
          target="_blank"
        >
          Arkesia.gg
        </Anchor>
        <Anchor
          size="xs"
          href="https://th.gl/"
          title="Trophies app for League of Legends"
          target="_blank"
        >
          Trophy Hunter
        </Anchor>
        <Anchor
          size="xs"
          href="https://www.soc.gg/"
          title="A Songs of Conquest fansite"
          target="_blank"
        >
          SoC.gg
        </Anchor>
        <Anchor
          size="xs"
          href="https://github.com/lmachens/skeleton"
          title="Simply display any website as customizable Overlay"
          target="_blank"
        >
          Skeleton
        </Anchor>
        <Anchor size="xs" href="/privacy.html" target="_blank">
          Privacy Policy
        </Anchor>
      </Group>
    </Paper>
  );
}

export default Footer;
