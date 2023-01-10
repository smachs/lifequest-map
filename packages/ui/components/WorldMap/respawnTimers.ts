type RespawnTimer = {
  markerId: string;
  respawnTimer: number;
  markerType: string;
};
export const fetchRespawnTimers = async (worldName: string) => {
  return Promise.all<RespawnTimer[]>([
    fetch(`https://live1.aeternum-map.gg/api/live/respawns/${worldName}`).then(
      (response) => response.json()
    ),
    fetch(`https://live2.aeternum-map.gg/api/live/respawns/${worldName}`).then(
      (response) => response.json()
    ),
  ]).then(([live1, live2]) => [...live1, ...live2]);
};
