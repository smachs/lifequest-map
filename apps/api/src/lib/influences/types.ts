export type InfluenceDTO = {
  worldName: string;
  influence: {
    regionName: string;
    factionName: string;
  }[];
  createdAt: Date;
};
