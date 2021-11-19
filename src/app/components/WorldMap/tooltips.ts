import type { MarkerBasic } from '../../contexts/MarkersContext';
import type { Details } from '../AddResources/AddResources';
import type { FilterItem } from '../MapFilter/mapFilters';

export function getTooltipContent(
  markerOrDetails: MarkerBasic | Details,
  mapFilter: FilterItem
): () => string {
  return () => {
    let tooltipContent = markerOrDetails.name
      ? `${markerOrDetails.name} (${mapFilter.title})`
      : mapFilter.title;
    if (markerOrDetails.level) {
      tooltipContent += `<br/>Level ${markerOrDetails.level}`;
    }
    return tooltipContent;
  };
}
