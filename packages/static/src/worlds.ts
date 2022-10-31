import worlds from './worlds.json' assert { type: 'json' };
import zones from './zones.json' assert { type: 'json' };

export { worlds, zones };

export const getWorld = (worldName: string) =>
  worlds.find((world) => world.worldName === worldName);

export const getZone = (id: string) => zones.find((zone) => zone.id === id);
