import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';
import styles from './MarkerRoute.module.css';
import { classNames } from '../../utils/styles';
import { toTimeAgo } from '../../utils/dates';
import EditButton from '../EditButton/EditButton';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import ForkButton from '../ForkButton/ForkButton';
import { useState } from 'react';
import { Switch } from '@mantine/core';
import { Link } from 'react-router-dom';
import { findMapDetails } from 'static';

type MarkerRouteProps = {
  markerRoute: MarkerRouteItem;
  selected: boolean;
  editable: boolean;
  onSelect: (checked: boolean) => void;
  isFavorite: boolean;
  onFavorite: () => void;
  onFork: (name: string) => void;
  onEdit: () => void;
  isOwner: boolean;
};
function MarkerRoute({
  markerRoute,
  selected,
  editable,
  onSelect,
  onFavorite,
  isFavorite,
  onFork,
  onEdit,
  isOwner,
}: MarkerRouteProps): JSX.Element {
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);
  let url = '/';
  if (markerRoute.map) {
    const mapDetails = findMapDetails(markerRoute.map);
    if (mapDetails) {
      url += `${mapDetails.title}/`;
    }
  }
  url += `routes/${markerRoute._id}${location.search}`;

  return (
    <article
      className={classNames(styles.container, selected && styles.selected)}
    >
      <Link to={url} style={{ textDecoration: 'none' }}>
        <h4 className={styles.title} title={markerRoute.name}>
          {markerRoute.name}
        </h4>
      </Link>
      <div className={styles.regions}>{markerRoute.regions.join(', ')}</div>
      <small className={styles.info}>
        {toTimeAgo(new Date(markerRoute.updatedAt))} by{' '}
        <span className={classNames(isOwner ? styles.owner : styles.notOwner)}>
          {markerRoute.username}
        </span>
        <span
          className={classNames(
            markerRoute.isPublic ? styles.public : styles.private
          )}
          title={
            markerRoute.isPublic
              ? 'Visible for everyone'
              : 'Only visible for you'
          }
        >
          {markerRoute.isPublic ? ' (Public)' : ' (Private)'}
        </span>
      </small>
      <MarkerTypes markersByType={markerRoute.markersByType} />
      <p
        className={classNames(
          styles.description,
          isDescriptionCollapsed && styles.collapsed
        )}
        onClick={(event) => {
          event.stopPropagation();
          setIsDescriptionCollapsed(!isDescriptionCollapsed);
        }}
        title={markerRoute.description}
      >
        {markerRoute.description || 'No description'}
      </p>

      <div className={styles.actions}>
        <Switch
          title="Toggle route"
          color="green"
          checked={selected}
          onChange={(event) => {
            onSelect(event.target.checked);
          }}
        />
        <FavoriteButton
          onClick={onFavorite}
          isFavorite={isFavorite}
          favorites={markerRoute.favorites || 0}
        />
        <ForkButton
          onFork={onFork}
          originalName={markerRoute.name}
          forked={markerRoute.forks || 0}
        />
        {editable && <EditButton onClick={onEdit} />}
      </div>
    </article>
  );
}

export default MarkerRoute;
