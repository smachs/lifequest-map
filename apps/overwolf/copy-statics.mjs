import fs from 'node:fs/promises';

import manifest from './manifest.json' assert { type: 'json' };

manifest.meta.name = manifest.meta.name.replace('-DEV', '');
delete manifest.data.windows.background.debug_url;
delete manifest.data.windows.desktop.debug_url;
delete manifest.data.windows.overlay.debug_url;
delete manifest.data.windows.minimap.debug_url;
delete manifest.data.windows.influence.debug_url;
manifest.data.windows.background.block_top_window_navigation = true;
manifest.data.windows.desktop.block_top_window_navigation = true;
manifest.data.windows.overlay.block_top_window_navigation = true;
manifest.data.windows.minimap.block_top_window_navigation = true;
manifest.data.windows.influence.block_top_window_navigation = true;

await fs.writeFile('./dist/manifest.json', JSON.stringify(manifest));
await fs.cp('./icons/', './dist/icons/', { recursive: true });
