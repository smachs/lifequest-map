export type InfluenceDTO = {
  worldName: string;
  influence: {
    regionName: string;
    factionName: string;
  }[];
  userId: string;
  username: string;
  createdAt: Date;
};
