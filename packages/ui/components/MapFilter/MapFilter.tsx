import { useModal } from '../../contexts/ModalContext';
import { classNames } from '../../utils/styles';
import styles from './MapFilter.module.css';
import MarkerIcon from '../icons/MarkerIcon';
import MarkersView from './MarkersView';
import MenuOpenIcon from '../icons/MenuOpenIcon';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
import MarkerRoutes from '../MarkerRoutes/MarkerRoutes';
import RoutesIcon from '../icons/RoutesIcon';
import PlayerIcon from '../icons/PlayerIcon';
import CompassIcon from '../icons/CompassIcon';
import MinimapSetup from '../Minimap/MinimapSetup';
import usePersistentState from '../../utils/usePersistentState';
import SettingsIcon from '../icons/SettingsIcon';
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
import MarkerRouteDetails from '../MarkerRoutes/MarkerRouteDetails';
import shallow from 'zustand/shallow';
import { useSettingsStore } from '../../utils/settingsStore';
import { useUserStore } from '../../utils/userStore';
import { IconFlag, IconUsers } from '@tabler/icons';
import Influences from '../Influences/Influences';
import { Navbar, Tooltip } from '@mantine/core';
import { useDidUpdate } from '@mantine/hooks';

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
  const { view, toView } = useView();

  const [isOpen, setIsOpen] = usePersistentState(
    'aeternum-map-client.sidebar-state',
    !view.embed
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

  useDidUpdate(() => {
    setIsOpen(true);
  }, [view.section]);

  const isSyncing =
    (account?.liveShareToken || liveShareToken) &&
    (account?.liveShareServerUrl || liveShareServerUrl);

  return (
    <Navbar width={{ base: 400 }} hidden={!isOpen}>
      <div className={styles.content}>
        <SelectMap />
        <MarkerRouteDetails onEdit={onMarkerRouteUpsert} />
        {view.section === 'nodes' && (
          <MarkersView onAdd={() => onMarkerCreate()} />
        )}
        {view.section === 'routes' && (
          <MarkerRoutes onEdit={onMarkerRouteUpsert} />
        )}
        {view.section === 'influences' && <Influences />}
        <Footer />
      </div>
      <nav className={styles.nav}>
        <MapSearch className={styles.nav__button} />
        <Tooltip label="Nodes" position="right">
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
        </Tooltip>
        <Tooltip label="Routes" position="right">
          <Link
            to={toView({ section: 'routes' })}
            className={classNames(
              styles.nav__button,
              view.section === 'routes' && styles.nav__active
            )}
          >
            <RoutesIcon />
          </Link>
        </Tooltip>
        <Tooltip label="Influences (under construction)" position="right">
          <Link
            to={toView({ section: 'influences' })}
            className={classNames(
              styles.nav__button,
              view.section === 'influences' && styles.nav__active
            )}
          >
            <IconFlag />
          </Link>
        </Tooltip>
        <Tooltip label="Settings" position="right">
          <Link
            to={toView({ section: 'settings' })}
            className={classNames(
              styles.nav__button,
              view.section === 'settings' && styles.nav__active
            )}
          >
            <SettingsIcon />
          </Link>
        </Tooltip>
        <Tooltip label="Share live status" position="right">
          <button
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
        </Tooltip>
        <Tooltip label="Follow position" position="right">
          <button
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
        </Tooltip>
        <Tooltip label="Show other players (all servers)" position="right">
          <button
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
        </Tooltip>
        <Tooltip label="Setup minimap" position="right">
          <button
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
        </Tooltip>
        <Tooltip label="Toggle sidebar" position="right">
          <button
            className={classNames(styles.nav__button, styles.nav__border)}
            onClick={() => setIsOpen(!isOpen)}
          >
            <MenuOpenIcon />
          </button>
        </Tooltip>
      </nav>
    </Navbar>
  );
}

export default MapFilter;
