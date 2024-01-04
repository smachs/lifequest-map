import 'reflect-metadata';

import {
  OwCliContainer,
  PackOpkCommand,
  ReleaseOpkCommand,
  SignOpkCommand,
  UploadOpkCommand,
} from '@overwolf/ow-cli/bin/index.js';

const PREVIEW_ACCESS_CHANNEL_ID = process.env.PREVIEW_ACCESS_CHANNEL_ID;
const FILE_NAME = 'app';
const FOLDER_PATH = 'apps/overwolf/dist';

OwCliContainer.init();

const packOpkCmd = OwCliContainer.resolve(PackOpkCommand);
const signOpkCmd = OwCliContainer.resolve(SignOpkCommand);
const uploadOpkCmd = OwCliContainer.resolve(UploadOpkCommand);
const releaseOpkCmd = OwCliContainer.resolve(ReleaseOpkCommand);

await packOpkCmd.handler({
  folderPath: FOLDER_PATH,
  outputFile: `${FILE_NAME}.opk`,
});
await signOpkCmd.handler({
  filePath: `${FILE_NAME}.opk`,
  outputFile: `${FILE_NAME}.signed.opk`,
});
if (PREVIEW_ACCESS_CHANNEL_ID) {
  const versionId = await uploadOpkCmd.handler({
    filePath: `${FILE_NAME}.signed.opk`,
    channelId: +PREVIEW_ACCESS_CHANNEL_ID,
    wait: true,
  });
  await releaseOpkCmd.handler({
    versionId,
    percent: 100,
    channelId: +PREVIEW_ACCESS_CHANNEL_ID,
  });
} else {
  const versionId = await uploadOpkCmd.handler({
    filePath: `${FILE_NAME}.signed.opk`,
    wait: true,
  });
  await releaseOpkCmd.handler({
    versionId,
    percent: 100,
  });
}
