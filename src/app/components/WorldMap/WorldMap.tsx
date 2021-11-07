import styles from './WorldMap.module.css';
import useWorldMap from './useWorldMap';
import useLayerGroups from './useLayerGroups';
import { useModal } from '../../contexts/ModalContext';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import usePlayerPosition from './usePlayerPosition';
import { classNames } from '../../utils/styles';
import type { CSSProperties } from 'react';

type WorldMapProps = {
  hideControls?: boolean;
  initialZoom?: number;
  alwaysFollowing?: boolean;
  className?: string;
  style?: CSSProperties;
  rotate?: boolean;
};

function WorldMap({
  className,
  hideControls,
  initialZoom,
  alwaysFollowing,
  style,
  rotate,
}: WorldMapProps): JSX.Element {
  const { addModal } = useModal();

  const { leafletMap, elementRef } = useWorldMap({
    selectMode: false,
    hideControls,
    initialZoom,
  });
  useLayerGroups({
    leafletMap,
    onMarkerClick: (marker) => {
      addModal({
        children: <MarkerDetails marker={marker} />,
      });
    },
    pmIgnore: true,
  });
  usePlayerPosition({ leafletMap, alwaysFollowing, rotate });

  return (
    <div
      className={classNames(styles.map, className)}
      ref={elementRef}
      style={style}
    />
  );
}

export default WorldMap;
