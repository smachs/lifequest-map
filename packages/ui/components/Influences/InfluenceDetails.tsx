import leaflet from 'leaflet';
import { Button, Dialog, Slider, Text } from '@mantine/core';
import { IconFlag } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { regions, worlds } from 'static';
import { fetchJSON } from '../../utils/api';
import { isEmbed } from '../../utils/routes';
import { latestLeafletMap } from '../WorldMap/useWorldMap';

export type InfluenceDTO = {
  worldName: string;
  username: string;
  influence: {
    regionName: string;
    factionName: string;
  }[];
  createdAt: string;
};

export const SYNDICATE_COLOR = 'rgb(130, 95, 130)';
export const COVENANT_COLOR = 'rgb(152, 100, 43)';
export const MARAUDER_COLOR = 'rgb(95, 135, 76)';
export const NEUTRAL_COLOR = 'rgb(200 200 200)';

const InfluenceDetails = () => {
  const { world: publicName } = useParams();
  const world = worlds.find((world) => world.publicName === publicName);

  const { data: influences = [] } = useQuery(
    ['influences', world?.worldName],
    () => fetchJSON<InfluenceDTO[]>(`/api/influences/${world?.worldName}`),
    {
      enabled: Boolean(world),
      onSuccess(data) {
        if (index === -1 || data[0].worldName !== influences?.[0]?.worldName) {
          setIndex(data.length - 1);
        }
      },
    }
  );
  const [index, setIndex] = useState(-1);
  const navigate = useNavigate();

  const influence = influences?.[index];
  useEffect(() => {
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
  }, [influence]);

  if (!world) {
    return <></>;
  }

  let label: string;
  if (!influence) {
    label = 'Loading...';
  } else {
    const date = new Date(influence.createdAt);
    label = `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
  }

  const content = (
    <Dialog
      opened
      withCloseButton={!isEmbed}
      onClose={() => navigate('/' + location.search)}
      position={{ top: isEmbed ? 7 : 48, right: 7 }}
    >
      <Text size="sm" style={{ marginBottom: 10 }} weight={500}>
        {world.publicName}
      </Text>

      <Text>{label}</Text>
      <Slider
        value={index}
        onChange={setIndex}
        min={0}
        max={influences.length - 1}
        step={1}
        label={null}
      />
    </Dialog>
  );

  if (isEmbed) {
    return (
      <>
        {content}
        <Button
          variant="default"
          component="a"
          href={`https://aeternum-map.gg/influences/${publicName}?section=influences`}
          target="_blank"
          leftIcon={<IconFlag />}
          radius="xl"
        >
          {publicName}
        </Button>
      </>
    );
  }

  return content;
};

export default InfluenceDetails;
