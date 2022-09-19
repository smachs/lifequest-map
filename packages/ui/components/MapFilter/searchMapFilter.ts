import { escapeRegExp } from '../../utils/regExp';
import type { FilterItem } from 'static';

export function searchMapFilter(
  search: string
): (mapFilter: FilterItem) => boolean {
  const regExp = new RegExp(escapeRegExp(search), 'i');
  return (mapFilter: FilterItem) => Boolean(mapFilter.title.match(regExp));
}
