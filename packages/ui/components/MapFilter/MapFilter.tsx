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
import SelectMap from './SelectMap';
import { useRouteParams, useView } from '../../utils/routes';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import type { MarkerFull } from '../MarkerDetails/useMarker';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import MarkerRouteDetails from '../MarkerRoutes/MarkerRouteDetails';
import shallow from 'zustand/shallow';
import { useSettingsStore } from '../../utils/settingsStore';
import { useUserStore } from '../../utils/userStore';
import { IconUsers } from '@tabler/icons';

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
  const account = useUserStore((state) => state.account);
  const {
    following,
    toggleFollowing,
    showOtherPlayers,
    toggleShowOtherPlayers,
  } = useSettingsStore(
    (state) => ({
      following: state.following,
      toggleFollowing: state.toggleFollowing,
      showOtherPlayers: state.showOtherPlayers,
      toggleShowOtherPlayers: state.toggleShowOtherPlayers,
    }),
    shallow
  );
  const { nodeId, routeId } = useRouteParams();
  const { view, toView } = useView();
  const { liveShareServerUrl, liveShareToken } = useSettingsStore(
    (state) => ({
      liveShareServerUrl: state.liveShareServerUrl,
      liveShareToken: state.liveShareToken,
    }),
    shallow
  );
  useDebounce(
    isOpen,
    () => latestLeafletMap?.invalidateSize({ pan: true, animate: true }),
    400
  );

  useEffect(() => {
    setIsOpen(true);
  }, [view.section]);

  const isSyncing =
    (account?.liveShareToken || liveShareToken) &&
    (account?.liveShareServerUrl || liveShareServerUrl);

  return (
    <aside className={classNames(styles.container, isOpen && styles.open)}>
      <div className={styles.content}>
        <User />
        <SelectMap />
        <MarkerDetails nodeId={nodeId} onEdit={onMarkerEdit} />
        <MarkerRouteDetails
          markerRouteId={routeId}
          onEdit={onMarkerRouteUpsert}
        />
        {view.section === 'nodes' && (
          <MarkersView onAdd={() => onMarkerCreate()} />
        )}
        {view.section === 'routes' && (
          <MarkerRoutes onEdit={onMarkerRouteUpsert} />
        )}
        {view.section === 'settings' && <Settings />}
        <Footer />
      </div>
      <nav className={styles.nav}>
        <MapSearch className={styles.nav__button} />
        <Link
          to={toView({ section: 'nodes' })}
          className={classNames(
            styles.nav__button,
            styles.nav__border,
            view.section === 'nodes' && styles.nav__active
          )}
        >
          <MarkerIcon />
        </Link>
        <Link
          to={toView({ section: 'routes' })}
          className={classNames(
            styles.nav__button,
            view.section === 'routes' && styles.nav__active
          )}
        >
          <RoutesIcon />
        </Link>
        <Link
          to={toView({ section: 'settings' })}
          className={classNames(
            styles.nav__button,
            view.section === 'settings' && styles.nav__active
          )}
        >
          <SettingsIcon />
        </Link>

        <button
          data-tooltip="Share live status"
          data-tooltip-position="right"
          onClick={() => {
            addModal({
              title: 'Share Live Status',
              children: (
                <ShareLiveStatus
                  onActivate={() => {
                    closeLatestModal();
                  }}
                />
              ),
            });
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
          data-tooltip="Show other players (all servers)"
          data-tooltip-position="right"
          onClick={() => {
            toggleShowOtherPlayers();
          }}
          className={classNames(
            styles.nav__button,
            showOtherPlayers && styles.nav__active
          )}
        >
          <IconUsers />
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
