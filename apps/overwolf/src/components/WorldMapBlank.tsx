import useWorldMap from 'ui/components/WorldMap/useWorldMap';
import styles from 'ui/components/WorldMap/WorldMap.module.css';
import { classNames } from 'ui/utils/styles';
import usePlayerPosition from './usePlayerPosition';

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
