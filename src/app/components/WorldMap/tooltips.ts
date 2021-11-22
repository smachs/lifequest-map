import type { MarkerBasic } from '../../contexts/MarkersContext';
import type { Details } from '../AddResources/AddResources';
import type { FilterItem } from '../MapFilter/mapFilters';

export function getTooltipContent(
  markerOrDetails: MarkerBasic | Details,
  mapFilter: FilterItem
): () => string {
  return () => {
    if (mapFilter.category === 'chests') {
      let content = `${markerOrDetails.chestType || mapFilter.title} Chest`;
      if (markerOrDetails.tier) {
        content += ` T${markerOrDetails.tier}`;
      }
      return content;
    }
    let tooltipContent = markerOrDetails.name
      ? `${markerOrDetails.name} (${mapFilter.title})`
      : mapFilter.title;
    if (markerOrDetails.level) {
      tooltipContent += `<br/>Level ${markerOrDetails.level}`;
    }
    return tooltipContent;
  };
}
