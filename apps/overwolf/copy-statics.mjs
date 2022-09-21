import fs from 'node:fs/promises';

import manifest from './manifest.json' assert { type: 'json' };

manifest.meta.name = manifest.meta.name.replace('-DEV', '');

await fs.writeFile('./dist/manifest.json', JSON.stringify(manifest));
await fs.cp('./icons/', './dist/icons/', { recursive: true });
