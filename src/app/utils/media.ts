export function takeScreenshot(
  params?: Partial<overwolf.media.MemoryScreenshotParams>
): Promise<string> {
  return new Promise((resolve, reject) => {
    overwolf.media.getScreenshotUrl(
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
}
