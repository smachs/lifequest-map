import { fetchJSON } from 'ui/utils/api';
import { getCurrentWindow } from 'ui/utils/windows';
import { getGameInfo } from './games';
import { imageToCanvas, takeScreenshot } from './media';

type RGB = {
  r: number;
  g: number;
  b: number;
};

type Faction = {
  name: string;
} & RGB;

const THRESHOLD = 32;
export const factions: Faction[] = [
  {
    name: 'Syndicate',
    r: 130,
    g: 95,
    b: 130,
  },
  {
    name: 'Covenant',
    r: 152,
    g: 100,
    b: 43,
  },
  {
    name: 'Marauder',
    r: 95,
    g: 135,
    b: 76,
  },
  {
    name: 'Neutral',
    r: 168,
    g: 161,
    b: 155,
  },
];

const isInRange = (color: RGB, reference: RGB) => {
  return (
    reference.r - THRESHOLD < color.r &&
    reference.r + THRESHOLD > color.r &&
    reference.g - THRESHOLD < color.g &&
    reference.g + THRESHOLD > color.g &&
    reference.b - THRESHOLD < color.b &&
    reference.b + THRESHOLD > color.b
  );
};

const getFaction = (color: RGB) => {
  return factions.find((faction) => isInRange(color, faction));
};

export const regions = [
  {
    name: 'Brightwood',
    top: 225,
    left: 300,
    right: 390,
    bottom: 325,
    center: [315, 255],
  },
  {
    name: 'Brimstone Sands',
    top: 40,
    left: 25,
    right: 240,
    bottom: 195,
    center: [110, 97],
  },
  {
    name: 'Cutlass Keys',
    top: 535,
    left: 135,
    right: 250,
    bottom: 640,
    center: [176, 555],
  },
  {
    name: 'Ebonscale Reach',
    top: 230,
    left: 150,
    right: 260,
    bottom: 335,
    center: [160, 285],
  },
  {
    name: 'Edengrove',
    top: 100,
    left: 400,
    right: 500,
    bottom: 220,
    center: [430, 140],
  },
  {
    name: 'Everfall',
    top: 345,
    left: 270,
    right: 370,
    bottom: 405,
    center: [305, 330],
  },
  {
    name: 'First Light',
    top: 513,
    left: 270,
    right: 360,
    bottom: 605,
    center: [285, 550],
  },
  {
    name: 'Great Cleave',
    top: 110,
    left: 280,
    right: 380,
    bottom: 200,
    center: [300, 140],
  },
  {
    name: "Monarch's Bluffs",
    top: 400,
    left: 135,
    right: 257,
    bottom: 495,
    center: [170, 420],
  },
  {
    name: 'Mourningdale',
    top: 100,
    left: 540,
    right: 650,
    bottom: 220,
    center: [555, 155],
  },
  {
    name: 'Reekwater',
    top: 385,
    left: 390,
    right: 490,
    bottom: 500,
    center: [425, 425],
  },
  {
    name: 'Restless Shore',
    top: 265,
    left: 540,
    right: 620,
    bottom: 375,
    center: [550, 300],
  },
  {
    name: 'Shattered Mountain',
    top: 10,
    left: 280,
    right: 380,
    bottom: 100,
    center: [315, 45],
  },
  {
    name: "Weaver's Fen",
    top: 250,
    left: 410,
    right: 490,
    bottom: 350,
    center: [425, 280],
  },
  {
    name: 'Windsward',
    top: 435,
    left: 270,
    right: 370,
    bottom: 505,
    center: [300, 435],
  },
];

const getRegion = (row: number, col: number) => {
  return regions.find(
    (region) =>
      region.top < row &&
      region.bottom > row &&
      region.left < col &&
      region.right > col
  );
};

export type Influence = {
  regionName: string;
  factionName: string;
}[];

export const getInfluence = (imageData: ImageData): Influence => {
  const influenceByRegion: {
    [regionName: string]: {
      [factionName: string]: number;
    };
  } = regions.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.name]: {
        Syndicate: 0,
        Covenant: 0,
        Marauder: 0,
        Neutral: 0,
      },
    }),
    {}
  );

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const color = {
      r,
      g,
      b,
    };
    const row = Math.floor(i / (imageData.width * 4));
    const col = (i / 4) % imageData.width;
    const region = getRegion(row, col);
    const faction = getFaction(color);

    if (!region || !faction) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 0;
    } else {
      influenceByRegion[region.name][faction.name]++;
      imageData.data[i] = faction.r;
      imageData.data[i + 1] = faction.g;
      imageData.data[i + 2] = faction.b;
      imageData.data[i + 3] = 255;
    }
  }

  const influence = Object.entries(influenceByRegion)
    .filter(([regionName, factionPoints]) => {
      const region = regions.find((region) => region.name === regionName)!;
      const pixels =
        (region.bottom - region.top) * (region.right - region.left);

      return Object.values(factionPoints).some(
        (points) => points / pixels > 0.15
      );
    })
    .map(([regionName, factionPoints]) => {
      const highestFaction = Object.entries(factionPoints)
        .map(([faction, influence]) => ({ faction, influence }))
        .sort((a, b) => b.influence - a.influence)[0];
      return {
        regionName,
        factionName: highestFaction.faction,
      };
    });
  return influence;
};

export const takeInfluenceScreenshot = async () => {
  const currentWindow = await getCurrentWindow();

  const url = await takeScreenshot({
    crop: {
      x: currentWindow.left,
      y: currentWindow.top,
      width: currentWindow.width,
      height: currentWindow.height,
    },
  });
  const canvas = await imageToCanvas(url);
  return canvas;
};

export const uploadInfluence = async (blob: Blob, influence: Influence) => {
  const gameInfo = await getGameInfo();
  if (!gameInfo?.game_info?.world_name) {
    throw new Error('Can not read world name');
  }
  const worldName = gameInfo.game_info.world_name;
  const formData = new FormData();
  formData.append('screenshot', blob);
  formData.append('worldName', worldName);
  formData.append('influence', JSON.stringify(influence));

  return fetchJSON('/api/screenshots/influences', {
    method: 'POST',
    body: formData,
  });
};
