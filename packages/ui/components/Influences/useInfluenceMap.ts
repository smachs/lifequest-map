import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { regions, worlds } from 'static';
import { fetchJSON } from '../../utils/api';
import leaflet from 'leaflet';
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

const useInfluenceMap = (publicName?: string) => {
  const { data: influences = [] } = useQuery(['influences'], () =>
    fetchJSON<InfluenceDTO[]>('/api/influences')
  );

  useEffect(() => {
    if (!publicName) {
      return;
    }
    const world = worlds.find((world) => world.publicName === publicName);
    if (!world) {
      return;
    }
    const influence = influences.find(
      (influence) => influence.worldName === world.worldName
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
  }, [publicName, influences]);
};

export default useInfluenceMap;
