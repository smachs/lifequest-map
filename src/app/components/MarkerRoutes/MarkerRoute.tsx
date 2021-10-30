import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';
import styles from './MarkerRoute.module.css';
import { classNames } from '../../utils/styles';
import DeleteButton from '../DeleteButton/DeleteButton';
import { toTimeAgo } from '../../utils/dates';
import { usePosition } from '../../contexts/PositionContext';
import { calcDistance } from '../../utils/positions';
import PublicButton from '../PublicButton/PublicButton';

type MarkerRouteProps = {
  markerRoute: MarkerRouteItem;
  selected: boolean;
  editable: boolean;
  onClick: () => void;
  onRemove: () => void;
  isPublic: boolean;
  onPublic: () => void;
};
function MarkerRoute({
  markerRoute,
  selected,
  editable,
  onClick,
  onRemove,
  isPublic,
  onPublic,
}: MarkerRouteProps): JSX.Element {
  const { position } = usePosition();

  const distance: number | null = position
    ? calcDistance(markerRoute.positions[0], position)
    : null;

  return (
    <article
      key={markerRoute.name}
      className={classNames(styles.container, selected && styles.selected)}
      onClick={onClick}
    >
      <h4 className={styles.info} title={markerRoute.name}>
        {markerRoute.name}
      </h4>
      <small className={styles.info}>
        Added {toTimeAgo(new Date(markerRoute.createdAt))} by{' '}
        <b>{markerRoute.username}</b>
      </small>
      <MarkerTypes markersByType={markerRoute.markersByType} />
      {distance && <div className={styles.distance}>Distance: {distance}</div>}
      <div className={styles.actions}>
        {editable && <PublicButton isPublic={isPublic} onClick={onPublic} />}
        {editable && <DeleteButton onClick={onRemove} />}
      </div>
    </article>
  );
}

export default MarkerRoute;
