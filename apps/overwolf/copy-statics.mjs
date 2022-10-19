import fs from 'node:fs/promises';

import manifest from './manifest.json' assert { type: 'json' };

manifest.meta.name = manifest.meta.name.replace('-DEV', '');
delete manifest.data.windows.background.debug_url;
delete manifest.data.windows.desktop.debug_url;
delete manifest.data.windows.minimap.debug_url;

await fs.writeFile('./dist/manifest.json', JSON.stringify(manifest));
await fs.cp('./icons/', './dist/icons/', { recursive: true });
