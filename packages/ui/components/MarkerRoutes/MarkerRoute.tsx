import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';
import styles from './MarkerRoute.module.css';
import { classNames } from '../../utils/styles';
import { toTimeAgo } from '../../utils/dates';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import ForkButton from '../ForkButton/ForkButton';
import { useState } from 'react';
import { Badge, Group, Stack, Switch, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { findMapDetails } from 'static';
import { IconArrowFork } from '@tabler/icons';

type MarkerRouteProps = {
  markerRoute: MarkerRouteItem;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  isFavorite: boolean;
  isOwner: boolean;
};
function MarkerRoute({
  markerRoute,
  selected,
  onSelect,
  isFavorite,
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
      <Group>
        <Switch
          title="Toggle route"
          color="green"
          onLabel="ON"
          offLabel="OFF"
          checked={selected}
          onChange={(event) => {
            onSelect(event.target.checked);
          }}
        />
        <Badge size="sm" color={markerRoute.isPublic ? 'lime' : 'teal'}>
          {markerRoute.isPublic ? 'Public' : 'Private'}
        </Badge>
        <Badge leftSection="🤘" size="sm" color="orange">
          {markerRoute.favorites || 0}
        </Badge>
        <Badge
          leftSection={<IconArrowFork size={12} />}
          size="sm"
          color="indigo"
        >
          {markerRoute.forks || 0}
        </Badge>
      </Group>
      <Link to={url} style={{ textDecoration: 'none' }}>
        <Stack spacing={2}>
          <h4 className={styles.title} title={markerRoute.name}>
            {markerRoute.name}
          </h4>

          <div className={styles.regions}>{markerRoute.regions.join(', ')}</div>
          <Text size="xs" className={styles.info}>
            {toTimeAgo(new Date(markerRoute.updatedAt))} by{' '}
            <span
              className={classNames(isOwner ? styles.owner : styles.notOwner)}
            >
              {markerRoute.username}
            </span>
          </Text>
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
        </Stack>
      </Link>
    </article>
  );
}

export default MarkerRoute;
