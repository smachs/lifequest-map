import styles from './WorldMap.module.css';
import useWorldMap from './useWorldMap';
import useLayerGroups from './useLayerGroups';
import { useModal } from '../../contexts/ModalContext';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import usePlayerPosition from './usePlayerPosition';
import { classNames } from '../../utils/styles';
import type { CSSProperties } from 'react';
import type { MarkerBasic } from '../../contexts/MarkersContext';

type WorldMapProps = {
  hideControls?: boolean;
  initialZoom?: number;
  alwaysFollowing?: boolean;
  className?: string;
  style?: CSSProperties;
  rotate?: boolean;
  onMarkerEdit?: (marker: MarkerBasic) => void;
};

function WorldMap({
  className,
  hideControls,
  initialZoom,
  alwaysFollowing,
  style,
  rotate,
  onMarkerEdit,
}: WorldMapProps): JSX.Element {
  const { addModal, closeLatestModal } = useModal();

  const { leafletMap, elementRef } = useWorldMap({
    hideControls,
    initialZoom,
  });
  useLayerGroups({
    leafletMap,
    onMarkerClick: (marker) => {
      if (onMarkerEdit) {
        addModal({
          children: (
            <MarkerDetails
              marker={marker}
              onEdit={() => {
                onMarkerEdit(marker);
                closeLatestModal();
              }}
            />
          ),
        });
      }
    },
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
