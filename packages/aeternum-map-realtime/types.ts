export type Position = { location: [number, number]; rotation: number };
export type Player = {
  steamId: string;
  steamName: string;
  username: string | null;
  position: Position | null;
  location: string | null;
  region: string | null;
  worldName: string | null;
  map: string | null;
};
export type Group = {
  [playerToken: string]: Player;
};
