import type { FilterItem } from 'static';
import type { MarkerBasic } from '../../contexts/MarkersContext';
import type { Details } from '../AddResources/AddResources';

function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function getTooltipContent(
  markerOrDetails: MarkerBasic | Details,
  mapFilter: FilterItem
): () => string {
  return () => {
    let additionalContent = '';
    if ('comments' in markerOrDetails && markerOrDetails.comments) {
      additionalContent +=
        '<p class="leaflet-tooltip-comments">Has Comments</p>';
    }
    if ('issues' in markerOrDetails && markerOrDetails.issues) {
      additionalContent += '<p class="leaflet-tooltip-issues">Has Issues</p>';
    }
    if (markerOrDetails.isTemporary) {
      additionalContent +=
        '<p class="leaflet-tooltip-temporary">Temporary/Randomly</p>';
    }
    if (markerOrDetails.realm) {
      additionalContent += `<p class="leaflet-tooltip-realm">${markerOrDetails.realm.toUpperCase()} Only</p>`;
    }
    if ('description' in markerOrDetails && markerOrDetails.description) {
      additionalContent += `<p class="leaflet-tooltip-description">${escapeHtml(
        markerOrDetails.description
      )}</p>`;
    }

    if (
      mapFilter.category === 'chests' &&
      mapFilter.type.includes('Supplies')
    ) {
      const isElite = mapFilter.title.includes('Elite');
      const chestname = mapFilter.title.split(' ').pop();
      let content = `${isElite ? 'Elite ' : ''}${
        markerOrDetails.chestType ||
        mapFilter.title.split(' ').slice(0, -1).join(' ')
      } ${chestname}`;
      if (markerOrDetails.tier) {
        content += ` T${markerOrDetails.tier}`;
      }
      content += additionalContent;
      return content;
    }
    if (mapFilter.category === 'chests') {
      let content = `${mapFilter.title}`;
      if (markerOrDetails.tier) {
        content += ` T${markerOrDetails.tier}`;
      }
      content += additionalContent;
      return content;
    }
    let tooltipContent = markerOrDetails.name
      ? `${escapeHtml(markerOrDetails.name)} (${mapFilter.title})`
      : mapFilter.title;
    if (markerOrDetails.size) {
      tooltipContent += ` (${markerOrDetails.size})`;
    }

    if (markerOrDetails.level) {
      tooltipContent += `<br/>Level ${markerOrDetails.level}`;
    }
    tooltipContent += additionalContent;
    return tooltipContent;
  };
}
