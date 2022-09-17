export type RealtimeServer = {
  name: string;
  url: string;
};

export const servers: RealtimeServer[] = [
  {
    name: 'Europe',
    url: 'wss://live1.aeternum-map.gg',
  },
  {
    name: 'US',
    url: 'wss://live2.aeternum-map.gg',
  },
];
