import { useModal } from '../../contexts/ModalContext';
import { classNames } from '../../utils/styles';
import styles from './MapFilter.module.css';
import MarkerIcon from '../icons/MarkerIcon';
import MarkersView from './MarkersView';
import MenuOpenIcon from '../icons/MenuOpenIcon';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
import MarkerRoutes from '../MarkerRoutes/MarkerRoutes';
import User from '../User/User';
import RoutesIcon from '../icons/RoutesIcon';
import PlayerIcon from '../icons/PlayerIcon';
import CompassIcon from '../icons/CompassIcon';
import MinimapSetup from '../Minimap/MinimapSetup';
import usePersistentState from '../../utils/usePersistentState';
import SettingsIcon from '../icons/SettingsIcon';
import Settings from '../Settings/Settings';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import MapSearch from '../MapSearch/MapSearch';
import useDebounce from '../../utils/useDebounce';
import BroadcastIcon from '../icons/BroadcastIcon';
import ShareLiveStatus from '../ShareLiveStatus/ShareLiveStatus';
import Footer from '../Footer/Footer';
import { usePlayer } from '../../contexts/PlayerContext';
import SelectMap from './SelectMap';
import { useMap, useNodeId } from '../../utils/routes';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import type { MarkerFull } from '../MarkerDetails/useMarker';
import { NavLink, useLocation, useMatches } from 'react-router-dom';
import { findMapDetails, mapIsAeternumMap } from 'static';
import { useEffect } from 'react';

type MarkerFilterProps = {
  onMarkerCreate: () => void;
  onMarkerRouteUpsert: (target: MarkerRouteItem | true) => void;
  onMarkerEdit: (marker: MarkerFull) => void;
};
function MapFilter({
  onMarkerCreate,
  onMarkerRouteUpsert,
  onMarkerEdit,
}: MarkerFilterProps): JSX.Element {
  const { addModal, closeLatestModal } = useModal();
  const [isOpen, setIsOpen] = usePersistentState(
    'aeternum-map-client.sidebar-state',
    true
  );
  const { following, toggleFollowing, isSyncing, setIsSyncing } = usePlayer();
  const nodeId = useNodeId();

  const matches = useMatches();
  const location = useLocation();
  const map = useMap();
  const mapDetail = findMapDetails(map);
  const basePath =
    mapDetail && !mapIsAeternumMap(map) ? `/${mapDetail.title}/` : '/';

  useDebounce(
    isOpen,
    () => latestLeafletMap?.invalidateSize({ pan: true, animate: true }),
    400
  );

  const isNodes = matches.some((match) => match.id.startsWith('nodes'));
  const isRoutes = matches.some((match) => match.id.startsWith('routes'));
  const isSettings = matches.some((match) => match.id.startsWith('settings'));

  useEffect(() => {
    setIsOpen(true);
  }, [isNodes, isRoutes, isSettings]);

  return (
    <aside className={classNames(styles.container, isOpen && styles.open)}>
      <div className={styles.content}>
        <User />
        <SelectMap />
        <MarkerDetails nodeId={nodeId} onEdit={onMarkerEdit} />
        {isNodes && <MarkersView onAdd={() => onMarkerCreate()} />}
        {isRoutes && <Settings />}
        {isSettings && <MarkerRoutes onEdit={onMarkerRouteUpsert} />}
        <Footer />
      </div>
      <nav className={styles.nav}>
        <MapSearch className={styles.nav__button} />
        <NavLink
          to={`${basePath}${location.search}`}
          end
          className={({ isActive }) =>
            classNames(
              styles.nav__button,
              styles.nav__border,
              isActive && styles.nav__active
            )
          }
        >
          <MarkerIcon />
        </NavLink>
        <NavLink
          to={`${basePath}routes${location.search}`}
          end
          className={({ isActive }) =>
            classNames(styles.nav__button, isActive && styles.nav__active)
          }
        >
          <RoutesIcon />
        </NavLink>
        <NavLink
          to={`${basePath}settings${location.search}`}
          end
          className={({ isActive }) =>
            classNames(styles.nav__button, isActive && styles.nav__active)
          }
        >
          <SettingsIcon />
        </NavLink>

        <button
          data-tooltip="Share live status"
          data-tooltip-position="right"
          onClick={() => {
            if (!isSyncing) {
              addModal({
                title: 'Share Live Status',
                children: (
                  <ShareLiveStatus
                    onActivate={() => {
                      setIsSyncing(true);
                      closeLatestModal();
                    }}
                  />
                ),
              });
            } else {
              setIsSyncing(false);
            }
          }}
          className={classNames(
            styles.nav__button,
            styles.nav__border,
            isSyncing && styles.nav__active
          )}
        >
          <BroadcastIcon />
        </button>
        <button
          data-tooltip="Follow position"
          data-tooltip-position="right"
          disabled={!isSyncing}
          onClick={() => {
            toggleFollowing();
          }}
          className={classNames(
            styles.nav__button,
            following && styles.nav__active
          )}
        >
          <PlayerIcon />
        </button>
        <button
          data-tooltip="Show minimap"
          data-tooltip-position="right"
          onClick={() => {
            addModal({
              title: 'Setup minimap',
              children: <MinimapSetup />,
            });
          }}
          className={classNames(styles.nav__button, styles.nav__border)}
        >
          <CompassIcon />
        </button>
        <button
          data-tooltip="Show/Hide menu"
          data-tooltip-position="right"
          className={classNames(styles.nav__button, styles.nav__border)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <MenuOpenIcon />
        </button>
      </nav>
    </aside>
  );
}

export default MapFilter;
