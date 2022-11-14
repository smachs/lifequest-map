import { fetchJSON } from 'ui/utils/api';
import { getCurrentWindow } from 'ui/utils/windows';
import { getGameInfo } from './games';

export const takeScreenshot = (
  params?: Partial<overwolf.media.MemoryScreenshotParams>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    overwolf.media.getScreenshotUrl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        roundAwayFromZero: true,
        ...(params || {}),
      },
      (result) => {
        if (result.url) {
          resolve(result.url);
        } else {
          reject(result.error);
        }
      }
    );
  });
};

export const imageToCanvas = async (
  url: string
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      resolve(canvas);
    };
    image.onerror = async (error) => {
      reject(error);
    };
  });
};

export const toBlob = (canvas: HTMLCanvasElement) => {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject();
      }
    })
  );
};

export const getImageData = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d')!;
  return context.getImageData(0, 0, canvas.width, canvas.height);
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

const THRESHOLD = 30;
const SYNDICATE: RGB = {
  r: 124,
  g: 90,
  b: 125,
};

const COVENANT: RGB = {
  r: 168,
  g: 130,
  b: 76,
};

const MARAUDERS: RGB = {
  r: 85,
  g: 132,
  b: 76,
};

const NEUTRAL: RGB = {
  r: 168,
  g: 161,
  b: 155,
};

const toAverageColor = (color: RGB) => {
  return (color.r + color.g + color.b) / 3;
};

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

const regions = [
  {
    name: 'Brimstone Sands',
    rect: [],
  },
];

export const getInfluenceImageData = (imageData: ImageData) => {
  // console.log(imageData.data);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const color = {
      r,
      g,
      b,
    };
    const row = Math.floor(i / imageData.width);
    const col = i % imageData.width;

    if (isInRange(color, SYNDICATE)) {
      console.log(i, row, col);

      imageData.data[i] = SYNDICATE.r;
      imageData.data[i + 1] = SYNDICATE.g;
      imageData.data[i + 2] = SYNDICATE.b;
      imageData.data[i + 3] = 255;
    } else if (isInRange(color, NEUTRAL)) {
      imageData.data[i] = NEUTRAL.r;
      imageData.data[i + 1] = NEUTRAL.g;
      imageData.data[i + 2] = NEUTRAL.b;
      imageData.data[i + 3] = 255;
    } else if (isInRange(color, COVENANT)) {
      imageData.data[i] = COVENANT.r;
      imageData.data[i + 1] = COVENANT.g;
      imageData.data[i + 2] = COVENANT.b;
      imageData.data[i + 3] = 255;
    } else if (isInRange(color, MARAUDERS)) {
      imageData.data[i] = MARAUDERS.r;
      imageData.data[i + 1] = MARAUDERS.g;
      imageData.data[i + 2] = MARAUDERS.b;
      imageData.data[i + 3] = 255;
    } else {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 0;
    }
  }

  return imageData;
};

// export const to2d = (imageData: ImageData) => {
//   const array2d: number[][] = [];
//   for (let i = 0; i < imageData.height; i++) {
//     array2d[imageData.height - 1 - i] = [];
//     for (let j = 0; j < imageData.width; j++) {
//       const index = i * imageData.width + j;
//       const pixelColor = toAverageColor({
//         r: imageData.data[index],
//         g: imageData.data[index + 1],
//         b: imageData.data[index + 2],
//       });
//       array2d[imageData.height - 1 - i][j] = pixelColor;
//     }
//   }
//   return array2d;
// };

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
  getInfluenceImageData(imageData);
  // const result = await uploadInfluenceScreenshot(blob, worldName);
  // console.log(result);
};
