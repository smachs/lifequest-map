import { useModal } from '../../contexts/ModalContext';
import { classNames } from '../../utils/styles';
import { useRouter } from '../Router/Router';
import AreasView from './AreasView';
import styles from './MapFilter.module.css';
import MapIcon from '../icons/MapIcon';
import MarkerIcon from '../icons/MarkerIcon';
import MarkersView from './MarkersView';
import MenuOpenIcon from '../icons/MenuOpenIcon';
import { usePosition } from '../../contexts/PositionContext';
import Ads from '../Ads/Ads';
import MarkerRoutes from '../MarkerRoutes/MarkerRoutes';
import User from '../User/User';
import RoutesIcon from '../icons/RoutesIcon';
import PlayerIcon from '../icons/PlayerIcon';
import CompassIcon from '../icons/CompassIcon';
import useMinimap from '../Minimap/useMinimap';
import MinimapSetup from '../Minimap/MinimapSetup';
import usePersistentState from '../../utils/usePersistentState';
import SettingsIcon from '../icons/SettingsIcon';
import Settings from '../Settings/Settings';
import { useEffect } from 'react';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import MapSearch from '../MapSearch/MapSearch';

type View = 'markers' | 'settings' | 'areas' | 'markerRoutes';

function MapFilter(): JSX.Element {
  const { addModal } = useModal();
  const [isOpen, setIsOpen] = usePersistentState(
    'aeternum-map-client.sidebar-state',
    true
  );
  const { url, search } = useRouter();
  const { following, toggleFollowing } = usePosition();
  const [showMinimap, setShowMinimap] = useMinimap();

  useEffect(() => {
    setTimeout(() => {
      latestLeafletMap?.invalidateSize({ pan: false });
    }, 300);
  }, [isOpen]);

  function handleViewClick(view: View) {
    setIsOpen(true);
    search({
      filterCategory: view,
    });
  }
  const view = url.searchParams.get('filterCategory') || 'markers';

  return (
    <aside className={classNames(styles.container, isOpen && styles.open)}>
      <div className={styles.content}>
        <User />
        {view === 'markers' && <MarkersView />}
        {view === 'settings' && <Settings />}
        {view === 'areas' && <AreasView />}
        {view === 'markerRoutes' && <MarkerRoutes />}
        <ErrorBoundary>
          <Ads active={isOpen} />
        </ErrorBoundary>
      </div>
      <nav className={styles.nav}>
        <MapSearch className={styles.nav__button} />

        <button
          data-tooltip="Markers"
          data-tooltip-position="right"
          className={classNames(
            styles.nav__button,
            styles.nav__border,
            view === 'markers' && styles.nav__active
          )}
          onClick={() => handleViewClick('markers')}
        >
          <MarkerIcon />
        </button>
        <button
          data-tooltip="Routes"
          data-tooltip-position="right"
          className={classNames(
            styles.nav__button,
            view === 'markerRoutes' && styles.nav__active
          )}
          onClick={() => handleViewClick('markerRoutes')}
        >
          <RoutesIcon />
        </button>
        <button
          data-tooltip="Areas (Coming Soon)"
          data-tooltip-position="right"
          disabled
          className={classNames(
            styles.nav__button,
            view === 'areas' && styles.nav__active
          )}
          onClick={() => handleViewClick('areas')}
        >
          <MapIcon />
        </button>
        <button
          data-tooltip="Settings"
          data-tooltip-position="right"
          className={classNames(
            styles.nav__button,
            view === 'settings' && styles.nav__active
          )}
          onClick={() => handleViewClick('settings')}
        >
          <SettingsIcon />
        </button>

        <button
          data-tooltip="Follow position"
          data-tooltip-position="right"
          onClick={() => {
            toggleFollowing();
          }}
          className={classNames(
            styles.nav__button,
            styles.nav__border,
            following && styles.nav__active
          )}
        >
          <PlayerIcon />
        </button>
        <button
          data-tooltip="Show minimap"
          data-tooltip-position="right"
          onClick={() => {
            if (!showMinimap) {
              addModal({
                title: 'Setup minimap',
                children: <MinimapSetup />,
              });
            }
            setShowMinimap(!showMinimap);
          }}
          className={classNames(
            styles.nav__button,
            styles.nav__border,
            showMinimap && styles.nav__active
          )}
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
