import { Router } from 'express';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';
import path from 'path';
import { getNodeMeta, getRouteMeta } from 'static';
import { fileURLToPath } from 'url';
import { getMarkerRoutesCollection } from './markerRoutes/collection.js';
import { getMarkersCollection } from './markers/collection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlRouter = Router();

const productionHTML = (
  await fs.readFile(path.join(__dirname, '../../../www/dist/index.html'))
).toString();
const metaStartIndex = productionHTML.indexOf('<!-- META-START -->');
const metaEndIndex = productionHTML.indexOf('<!-- META-END -->');

const replaceMeta = (meta: string) => {
  return (
    productionHTML.substring(0, metaStartIndex + 19) +
    meta +
    productionHTML.substring(metaEndIndex)
  );
};
htmlRouter.get('/nodes/:id', async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');

  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    res.status(400).send(productionHTML);
    return;
  }
  const node = await getMarkersCollection().findOne({
    _id: new ObjectId(id),
  });
  if (!node) {
    res.status(404).send(productionHTML);
    return;
  }

  const { title, description } = getNodeMeta({
    name: node.name,
    type: node.type,
    position: node.position.map(Number) as [number, number, number],
    map: node.map,
  });
  const imageTag =
    node.screenshotFilename &&
    `https://aeternum-map.gg/screenshots/${node.screenshotFilename}`;
  const html = replaceMeta(`
<link rel="canonical" href="https://aeternum-map.gg/nodes/${id}" />
<title>${title}</title>
<meta name="description" content="${description}"/>

<meta property="og:type" content="website">
<meta property="og:url" content="https://aeternum-map.gg/nodes/${id}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
${imageTag ? `<meta property="og:image" content="${imageTag}">` : ''}

<meta property="twitter:card" content="${
    imageTag ? 'summary_large_image' : 'summary'
  }">
<meta property="twitter:url" content="https://aeternum-map.gg/nodes/${id}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
${imageTag ? `<meta property="twitter:image" content="${imageTag}">` : ''}
`);
  res.send(html);
});
htmlRouter.get('/routes/:id', async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');

  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    res.status(400).send(productionHTML);
    return;
  }
  const route = await getMarkerRoutesCollection().findOne({
    _id: new ObjectId(id),
  });
  if (!route) {
    res.status(404).send(productionHTML);
    return;
  }

  const { title, description } = getRouteMeta(route);
  const html = replaceMeta(
    `
<link rel="canonical" href="https://aeternum-map.gg/routes/${id}" />
<title>${title}</title>
<meta name="description" content="${description}"/>

<meta property="og:type" content="website">
<meta property="og:url" content="https://aeternum-map.gg/routes/${id}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">

<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://aeternum-map.gg/routes/${id}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
`
  );
  res.send(html);
});

export default htmlRouter;
