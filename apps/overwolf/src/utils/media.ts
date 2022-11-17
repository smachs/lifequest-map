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

export const loadImage = (path: string) => {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.src = path;
    image.onload = () => {
      resolve(image);
    };
  });
};
