import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';
import styles from './MarkerRoute.module.css';
import { classNames } from '../../utils/styles';
import DeleteButton from '../DeleteButton/DeleteButton';
import { toTimeAgo } from '../../utils/dates';
import { usePosition } from '../../contexts/PositionContext';
import { calcDistance } from '../../utils/positions';
import EditButton from '../EditButton/EditButton';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import PublicIcon from '../icons/PublicIcon';
import PrivateIcon from '../icons/PrivateIcon';

type MarkerRouteProps = {
  markerRoute: MarkerRouteItem;
  selected: boolean;
  isPublic: boolean;
  editable: boolean;
  onClick: () => void;
  onRemove: () => void;
  isFavorite: boolean;
  onFavorite: () => void;
  onEdit: () => void;
};
function MarkerRoute({
  markerRoute,
  selected,
  isPublic,
  editable,
  onClick,
  onRemove,
  onFavorite,
  isFavorite,
  onEdit,
}: MarkerRouteProps): JSX.Element {
  const { position } = usePosition();

  const distance: number = calcDistance(
    markerRoute.positions[0],
    position.location
  );

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
      {distance && (
        <div className={styles.distance}>
          <span title={isPublic ? 'Public route' : 'Private route'}>
            {isPublic ? <PublicIcon /> : <PrivateIcon />}
          </span>{' '}
          Distance: {distance}
        </div>
      )}
      <div className={styles.actions}>
        <FavoriteButton
          onClick={onFavorite}
          isFavorite={isFavorite}
          favorites={markerRoute.favorites || 0}
        />
        {editable && <EditButton onClick={onEdit} />}
        {editable && (
          <DeleteButton
            onClick={onRemove}
            title={`Do you really want to delete ${markerRoute.name}?`}
          />
        )}
      </div>
    </article>
  );
}

export default MarkerRoute;
