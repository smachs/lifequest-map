import worlds from './worlds.json' assert { type: 'json' };
import zones from './zones.json' assert { type: 'json' };

export { worlds, zones };

export const getWorld = (worldName: string): World | undefined =>
  worlds.find((world) => world.worldName === worldName);

export const getZone = (id: string): Zone | undefined =>
  zones.find((zone) => zone.id === id);

export const getZonesWithWorlds = () => {
  return zones.map((zone) => ({
    ...zone,
    worlds: worlds.filter((world) => world.zone === zone.id),
  }));
};
export type World = typeof worlds[0];
export type Zone = typeof zones[0];
