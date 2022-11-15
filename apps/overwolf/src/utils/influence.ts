import { fetchJSON } from 'ui/utils/api';
import { getCurrentWindow } from 'ui/utils/windows';
import { getGameInfo } from './games';
import { getImageData, imageToCanvas, takeScreenshot, toBlob } from './media';

type RGB = {
  r: number;
  g: number;
  b: number;
};

type Faction = {
  name: string;
} & RGB;

const THRESHOLD = 25;
const factions: Faction[] = [
  {
    name: 'Syndicate',
    r: 124,
    g: 90,
    b: 125,
  },
  {
    name: 'Covenant',
    r: 168,
    g: 130,
    b: 76,
  },
  {
    name: 'Marauders',
    r: 85,
    g: 132,
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
    center: [330, 270],
  },
  {
    name: 'Brimstone Sands',
    top: 40,
    left: 20,
    right: 240,
    bottom: 200,
    center: [120, 120],
  },
  {
    name: 'Cutlass Keys',
    top: 535,
    left: 35,
    right: 260,
    bottom: 655,
    center: [180, 550],
  },
  {
    name: 'Ebonscale Reach',
    top: 230,
    left: 150,
    right: 260,
    bottom: 335,
    center: [180, 280],
  },
  {
    name: 'Edengrove',
    top: 100,
    left: 400,
    right: 500,
    bottom: 220,
    center: [440, 160],
  },
  {
    name: 'Everfall',
    top: 345,
    left: 270,
    right: 370,
    bottom: 405,
    center: [300, 360],
  },
  {
    name: 'First Light',
    top: 535,
    left: 270,
    right: 400,
    bottom: 635,
    center: [300, 580],
  },
  {
    name: 'Great Cleave',
    top: 110,
    left: 280,
    right: 380,
    bottom: 200,
    center: [310, 160],
  },
  {
    name: "Monarch's Bluffs",
    top: 395,
    left: 35,
    right: 260,
    bottom: 505,
    center: [150, 450],
  },
  {
    name: 'Mourningdale',
    top: 100,
    left: 540,
    right: 650,
    bottom: 220,
    center: [560, 170],
  },
  {
    name: 'Reekwater',
    top: 385,
    left: 380,
    right: 505,
    bottom: 505,
    center: [420, 420],
  },
  {
    name: 'Restless Shore',
    top: 265,
    left: 530,
    right: 650,
    bottom: 385,
    center: [570, 300],
  },
  {
    name: 'Shattered Mountain',
    top: 10,
    left: 280,
    right: 380,
    bottom: 100,
    center: [320, 70],
  },
  {
    name: "Weaver's Fen",
    top: 265,
    left: 410,
    right: 530,
    bottom: 365,
    center: [440, 300],
  },
  {
    name: 'Windsward',
    top: 430,
    left: 270,
    right: 370,
    bottom: 510,
    center: [300, 460],
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

export const getInfluence = (imageData: ImageData) => {
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
        Marauders: 0,
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
  const influence = Object.entries(influenceByRegion).map(
    ([regionName, factionPoints]) => {
      const highestFaction = Object.entries(factionPoints)
        .map(([faction, influence]) => ({ faction, influence }))
        .sort((a, b) => b.influence - a.influence)[0];
      return {
        regionName,
        factionName: highestFaction.faction,
      };
    }
  );
  return influence;
};

export const uploadInfluenceScreenshot = (blob: Blob, worldName: string) => {
  const formData = new FormData();
  formData.append('screenshot', blob);
  formData.append('worldName', worldName);

  return fetchJSON<{ screenshotId: string }>('/api/screenshots/influences', {
    method: 'POST',
    body: formData,
  });
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

export const addInfluenceScreenshot = async () => {
  const gameInfo = await getGameInfo();
  if (!gameInfo?.game_info?.world_name) {
    throw new Error('Can not read world name');
  }
  const worldName = gameInfo.game_info.world_name;

  const canvas = await takeInfluenceScreenshot();

  const blob = await toBlob(canvas);

  const imageData = getImageData(canvas);
  //   getInfluenceImageData(imageData);
  // const result = await uploadInfluenceScreenshot(blob, worldName);
  // console.log(result);
};
