import { validateInfluence } from 'static';
import { fetchJSON } from 'ui/utils/api';
import { getGameInfo } from './games';
import { imageToCanvas, takeScreenshot } from './media';
import { getCurrentWindow } from './windows';

type HSL = [number, number, number];

type Faction = {
  name: string;
  hsl: HSL;
};

export const factions: Faction[] = [
  {
    name: 'Syndicate',
    hsl: [300, 18, 42],
  },
  {
    name: 'Covenant',
    hsl: [35, 45, 49],
  },
  {
    name: 'Marauder',
    hsl: [103, 32, 35],
  },
  {
    name: 'Neutral',
    hsl: [54, 12, 67],
  },
];

const rgbToHSL = (r: number, g: number, b: number) => {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)] as HSL;
};

const isInRange = (color: HSL, reference: HSL) => {
  return (
    Math.abs(color[0] - reference[0]) < 40 &&
    Math.abs(color[1] - reference[1]) < 10 &&
    Math.abs(color[2] - reference[2]) < 20
  );
};

const getFaction = (color: HSL) => {
  return factions.find((faction) => isInRange(color, faction.hsl));
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
    name: 'Elysian Wilds',
    top: 523,
    left: 280,
    right: 350,
    bottom: 585,
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

export const validationRects = [
  {
    top: 618,
    left: 380,
    right: 409,
    bottom: 633,
  },
  {
    top: 517,
    left: 377,
    right: 408,
    bottom: 537,
  },
  {
    top: 393,
    left: 518,
    right: 552,
    bottom: 419,
  },
  {
    top: 277,
    left: 626,
    right: 640,
    bottom: 294,
  },
  {
    top: 61,
    left: 489,
    right: 522,
    bottom: 83,
  },
  {
    top: 0,
    left: 317,
    right: 363,
    bottom: 14,
  },
  {
    top: 13,
    left: 47,
    right: 68,
    bottom: 29,
  },
  {
    top: 214,
    left: 122,
    right: 153,
    bottom: 240,
  },
  {
    top: 356,
    left: 5,
    right: 21,
    bottom: 376,
  },
  {
    top: 390,
    left: 108,
    right: 123,
    bottom: 405,
  },
  {
    top: 507,
    left: 130,
    right: 150,
    bottom: 527,
  },
  {
    top: 617,
    left: 100,
    right: 123,
    bottom: 636,
  },
];

const getValidationRect = (row: number, col: number) => {
  return validationRects.findIndex(
    (rect) =>
      rect.top < row && rect.bottom > row && rect.left < col && rect.right > col
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
  const validationResults: {
    [index: string]: {
      [factionName: string]: number;
    };
  } = {};

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    const row = Math.floor(i / (imageData.width * 4));
    const col = (i / 4) % imageData.width;
    const region = getRegion(row, col);
    const hsl = rgbToHSL(r, g, b);
    const faction = getFaction(hsl);

    if (!region && faction) {
      const validationRect = getValidationRect(row, col);
      if (validationRect !== -1) {
        const index = validationRect.toString();
        if (!validationResults[index]) {
          validationResults[index] = {};
        }
        if (!validationResults[index][faction.name]) {
          validationResults[index][faction.name] = 0;
        }
        validationResults[index][faction.name]++;

        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = 255;
      }
    } else if (!region || !faction) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 0;
    } else {
      influenceByRegion[region.name][faction.name]++;
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
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
      const factionName = highestFaction.faction;

      return {
        regionName,
        factionName,
      };
    });

  Object.entries(validationResults).forEach(([index, factionPoints]) => {
    const validationRect = validationRects[+index];
    const pixels =
      (validationRect.bottom - validationRect.top) *
      (validationRect.right - validationRect.left);

    const invalidFactionPoints = Object.values(factionPoints).find(
      (points) => points / pixels > 0.15
    );
    if (invalidFactionPoints) {
      throw new Error(
        `Overlay position is invalid (code-${index} | ${invalidFactionPoints.toFixed(
          2
        )})`
      );
    }
  });

  validateInfluence(influence);

  return influence;
};

export const INFLUENCE_SIZE = [642, 640] as const;
export const takeInfluenceScreenshot = async () => {
  const currentWindow = await getCurrentWindow();

  const url = await takeScreenshot({
    crop: {
      x: currentWindow.left,
      y: currentWindow.top,
      width: currentWindow.width,
      height: currentWindow.height,
    },
    rescale: {
      width: INFLUENCE_SIZE[0],
      height: INFLUENCE_SIZE[1],
    },
  });
  const canvas = await imageToCanvas(url);
  return canvas;
};

export const uploadInfluence = async (blob: Blob, influence: Influence) => {
  const gameInfo = await getGameInfo();
  if (!gameInfo?.game_info?.world_name) {
    throw new Error(
      'Can not read world name. Make sure to run Overwolf before running New World.'
    );
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
