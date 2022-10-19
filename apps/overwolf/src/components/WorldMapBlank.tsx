import styles from 'ui/components/WorldMap/WorldMap.module.css';
import useWorldMap from 'ui/components/WorldMap/useWorldMap';
import usePlayerPosition from './usePlayerPosition';
import { classNames } from 'ui/utils/styles';

type WorldMapProps = {
  initialZoom?: number;
  className?: string;
  rotate?: boolean;
};

function WorldMap({
  className,
  initialZoom,
  rotate,
}: WorldMapProps): JSX.Element {
  const { leafletMap, elementRef } = useWorldMap({
    hideControls: true,
    initialZoom,
  });
  usePlayerPosition({ leafletMap, rotate });

  return <div className={classNames(styles.map, className)} ref={elementRef} />;
}

export default WorldMap;
