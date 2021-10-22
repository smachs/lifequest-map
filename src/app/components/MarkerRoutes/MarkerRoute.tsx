import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';
import styles from './MarkerRoute.module.css';
import { classNames } from '../../utils/styles';
import DeleteButton from '../DeleteButton/DeleteButton';
import { toTimeAgo } from '../../utils/dates';

type MarkerRouteProps = {
  markerRoute: MarkerRouteItem;
  selected: boolean;
  onClick: () => void;
  onRemove: (() => void) | false;
};
function MarkerRoute({
  markerRoute,
  selected,
  onClick,
  onRemove,
}: MarkerRouteProps): JSX.Element {
  return (
    <article
      key={markerRoute.name}
      className={classNames(styles.container, selected && styles.selected)}
      onClick={onClick}
    >
      <h4>{markerRoute.name}</h4>
      <small>
        Added {toTimeAgo(new Date(markerRoute.createdAt))} by{' '}
        <b>{markerRoute.username}</b>
      </small>
      <MarkerTypes markersByType={markerRoute.markersByType} />
      {onRemove && <DeleteButton onClick={onRemove} />}
    </article>
  );
}

export default MarkerRoute;
