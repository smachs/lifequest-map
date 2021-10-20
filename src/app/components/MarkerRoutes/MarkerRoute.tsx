import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';
import styles from './MarkerRoute.module.css';
import { classNames } from '../../utils/styles';

type MarkerRouteProps = {
  markerRoute: MarkerRouteItem;
  selected: boolean;
  onClick: () => void;
};
function MarkerRoute({
  markerRoute,
  selected,
  onClick,
}: MarkerRouteProps): JSX.Element {
  return (
    <article
      key={markerRoute.name}
      className={classNames(styles.container, selected && styles.selected)}
      onClick={onClick}
    >
      <h4>{markerRoute.name}</h4>
      <MarkerTypes markersByType={markerRoute.markersByType} />
    </article>
  );
}

export default MarkerRoute;
