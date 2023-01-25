import fs from 'fs/promises';
import path from 'path';
import {
  COVENANT_COLOR,
  MARAUDER_COLOR,
  NEUTRAL_COLOR,
  regions,
  SYNDICATE_COLOR,
  worlds,
} from 'static';
import { fileURLToPath } from 'url';
import type { InfluenceDTO } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInfluenceSVG = async (
  worldName: string,
  influence: InfluenceDTO['influence'],
  base64 = false
) => {
  const world = worlds.find((world) => world.worldName === worldName)!;

  const width = 672;
  const height = 672;
  const top = 10660;
  const left = 3700;
  const scale = 0.063;
  const polygons = regions.map((region) => {
    const factionName = influence.find(
      (item) => item.regionName === region.name
    )?.factionName;
    if (!factionName) {
      return null;
    }
    let color = '';
    if (factionName === 'Syndicate') {
      color = SYNDICATE_COLOR;
    } else if (factionName === 'Covenant') {
      color = COVENANT_COLOR;
    } else if (factionName === 'Marauder') {
      color = MARAUDER_COLOR;
    } else {
      color = NEUTRAL_COLOR;
    }
    const points = (region.coordinates as [number, number][]).map(
      (coordinate) =>
        `${Math.floor((coordinate[1] - left) * scale)},${Math.floor(
          (top - coordinate[0]) * scale
        )}`
    );
    return `<polygon points="${points.join(' ')}" fill="${color.replace(
      ')',
      ', 0.75)'
    )}" stroke="rgb(0, 0, 0, 0.5)" />`;
  });

  let influenceTemplateHref;
  if (base64) {
    const influenceTemplate = await fs.readFile(
      path.join(__dirname, '../../../public/influence-template.png')
    );
    const base64String = Buffer.from(influenceTemplate).toString('base64');
    influenceTemplateHref = `data:image/png;base64,${base64String}`;
  } else {
    influenceTemplateHref = '/assets/influence-template.png';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"  style="background: #859594">
    <title>${world.publicName}</title>
    <image href="${influenceTemplateHref}" />
    ${polygons}
  </svg>`;
  return svg;
};
