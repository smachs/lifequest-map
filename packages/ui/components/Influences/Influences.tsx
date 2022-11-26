import { useEffect, useState } from 'react';
import {
  Group,
  Box,
  Collapse,
  Text,
  UnstyledButton,
  ScrollArea,
  Avatar,
  Paper,
  SimpleGrid,
  Progress,
  Image,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { IconChevronRight, IconInfoCircle } from '@tabler/icons';
import { getZonesWithWorlds, regions, Zone } from 'static';
import { useQuery } from 'react-query';
import { fetchJSON } from '../../utils/api';
import useStyles from './Influences.styles';
import leaflet from 'leaflet';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import { toTimeAgo } from '../../utils/dates';

const zonesWithWorlds = getZonesWithWorlds();

interface InfluenceProps {
  influence?: InfluenceDTO;
}
const Influence = ({ influence }: InfluenceProps) => {
  if (!influence) {
    return null;
  }
  const { rankings } = getFactionRanking([influence]);
  return (
    <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'xs', cols: 1 }]} mt="xs">
      {rankings.map((ranking) => (
        <Group key={ranking.factionName} spacing={1}>
          <Avatar src={ranking.icon} size="sm" />
          <Text transform="uppercase" size="sm" color="dimmed" weight={700}>
            {ranking.part.toFixed(0)}%
          </Text>
        </Group>
      ))}
    </SimpleGrid>
  );
};

interface ZoneProps {
  zone: ReturnType<typeof getZonesWithWorlds>[0];
  influences: InfluenceDTO[];
  selectedWorldName: string | null;
  onWorldClick: (worldName: string) => void;
}
const Zone = ({
  zone,
  influences,
  selectedWorldName,
  onWorldClick,
}: ZoneProps) => {
  const { classes, theme, cx } = useStyles();
  const [opened, setOpened] = useState(false);
  const items = zone.worlds.map((world) => {
    const influence = influences.find(
      (influence) => influence.worldName === world.worldName
    );
    return (
      <UnstyledButton
        key={world.worldName}
        className={cx(
          classes.world,
          selectedWorldName === world.worldName && classes.selected
        )}
        onClick={() => onWorldClick(world.worldName)}
      >
        <Text size="sm" weight={500}>
          {world.publicName}
        </Text>
        <Influence influence={influence} />
        <Text color="dimmed" size="xs">
          {influence
            ? `Updated ${toTimeAgo(new Date(influence.createdAt))} by ${
                influence.username
              } ❤️`
            : 'Never updated'}
        </Text>
      </UnstyledButton>
    );
  });

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group position="apart" spacing={0}>
          <Box>{zone.name}</Box>
          <IconChevronRight
            className={classes.chevron}
            size={14}
            stroke={1.5}
            style={{
              transform: opened
                ? `rotate(${theme.dir === 'rtl' ? -90 : 90}deg)`
                : 'none',
            }}
          />
        </Group>
      </UnstyledButton>
      <Collapse in={opened}>{items}</Collapse>
    </>
  );
};

type InfluenceDTO = {
  worldName: string;
  username: string;
  influence: {
    regionName: string;
    factionName: string;
  }[];
  createdAt: string;
};

const SYNDICATE_COLOR = 'rgb(130, 95, 130)';
const COVENANT_COLOR = 'rgb(152, 100, 43)';
const MARAUDER_COLOR = 'rgb(95, 135, 76)';
const NEUTRAL_COLOR = 'rgb(200 200 200)';

const getFactionRanking = (influences: InfluenceDTO[]) => {
  const rankingByFaction = influences.reduce(
    (acc, cur) => {
      cur.influence.forEach(({ factionName }) => {
        if (acc[factionName]) {
          acc[factionName].count++;
        }
      });
      return acc;
    },
    {
      Syndicate: {
        color: SYNDICATE_COLOR,
        count: 0,
        icon: '/syndicate.webp',
      },
      Covenant: {
        color: COVENANT_COLOR,
        count: 0,
        icon: '/covenant.webp',
      },
      Marauder: {
        color: MARAUDER_COLOR,
        count: 0,
        icon: '/marauder.webp',
      },
    } as { [key: string]: { color: string; count: number; icon: string } }
  );

  const total =
    rankingByFaction.Syndicate.count +
    rankingByFaction.Covenant.count +
    rankingByFaction.Marauder.count;

  const rankings = Object.entries(rankingByFaction).map(
    ([factionName, ranking]) => ({
      factionName,
      ...ranking,
      part: (ranking.count / total) * 100,
    })
  );

  return {
    total,
    rankings,
  };
};

const Influences = () => {
  const { data: influences = [] } = useQuery(['influences'], () =>
    fetchJSON<InfluenceDTO[]>('/api/influences')
  );
  const { classes } = useStyles();
  const [selectedWorldName, setSelectedWorldName] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!selectedWorldName) {
      return;
    }
    const influence = influences.find(
      (influence) => influence.worldName === selectedWorldName
    );
    if (!influence) {
      return;
    }

    const polygons = regions.map((region) => {
      const factionName = influence.influence.find(
        (item) => item.regionName === region.name
      )?.factionName;
      if (!factionName) {
        return null;
      }
      let color = '';
      if (factionName === 'Syndicate') {
        color = SYNDICATE_COLOR;
      } else if (factionName === 'Covenant') {
        color = COVENANT_COLOR;
      } else if (factionName === 'Marauder') {
        color = MARAUDER_COLOR;
      } else {
        color = NEUTRAL_COLOR;
      }
      return leaflet.polygon(region.coordinates as [number, number][], {
        fillColor: color,
        fill: true,
        stroke: false,
        weight: 1.2,
        fillOpacity: 0.75,
        interactive: false,
        pmIgnore: true,
      });
    });

    polygons.forEach((polygon) => polygon?.addTo(latestLeafletMap!));
    return () => {
      polygons.forEach((polygon) => polygon?.removeFrom(latestLeafletMap!));
    };
  }, [selectedWorldName, influences]);

  const { rankings, total } = getFactionRanking(influences);
  const segments = rankings.map((ranking) => ({
    value: ranking.part,
    color: ranking.color,
    label: ranking.part > 10 ? `${ranking.part.toFixed(0)}%` : undefined,
  }));

  const descriptions = rankings.map((ranking) => (
    <Box
      key={ranking.factionName}
      sx={{ borderBottomColor: ranking.color }}
      className={classes.stat}
    >
      <Group spacing={1}>
        <Avatar src={ranking.icon} size="sm" />
        <Text transform="uppercase" size="sm" color="dimmed" weight={700}>
          {ranking.factionName}
        </Text>
      </Group>

      <Group position="apart" align="flex-end" spacing={0}>
        <Text weight={700}>{ranking.count}</Text>
        <Text
          color={ranking.color}
          weight={700}
          size="sm"
          className={classes.statCount}
        >
          {ranking.part.toFixed(0)}%
        </Text>
      </Group>
    </Box>
  ));

  return (
    <ScrollArea>
      <Paper withBorder p="md">
        <Group position="apart">
          <Group align="flex-end" spacing="xs">
            <Text size="xl" weight={700}>
              {total}
            </Text>
          </Group>
          <Tooltip
            zIndex={9000}
            width={320}
            multiline
            withinPortal
            label={
              <>
                <Text>Influence screenshot overlay</Text>
                <Text color="dimmed">
                  You can contribute by scanning the factions influence map on
                  your server with the{' '}
                  <Text component="span" color="cyan">
                    Aeternum Map app
                  </Text>
                  .
                  <Image
                    src="/influence-preview.webp"
                    fit="contain"
                    width={300}
                  />
                  The overlay is visible in-game and usable with a simple click.
                  Please move the influence map to fit the overlay.
                </Text>
              </>
            }
          >
            <ActionIcon>
              <IconInfoCircle size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Text color="dimmed" size="sm">
          Regions claimed
        </Text>
        <Progress
          sections={segments}
          size={34}
          classNames={{ label: classes.progressLabel }}
          mt={30}
        />
        <SimpleGrid
          cols={3}
          breakpoints={[{ maxWidth: 'xs', cols: 1 }]}
          mt="xl"
        >
          {descriptions}
        </SimpleGrid>
      </Paper>
      <Box p="sm">
        {zonesWithWorlds.map((zone) => (
          <Zone
            key={zone.id}
            zone={zone}
            influences={influences}
            selectedWorldName={selectedWorldName}
            onWorldClick={(worldName) =>
              setSelectedWorldName((prev) =>
                prev === worldName ? null : worldName
              )
            }
          />
        ))}
      </Box>
    </ScrollArea>
  );
};

export default Influences;
