import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AETERNUM_MAP, findMapDetails, mapDetails } from 'static';
import { deserializeMapView, serializeMapView } from './storage';

export const useRouteParams = () => {
  const { map = mapDetails[0].title, nodeId, routeId, world } = useParams();
  const existingMap = findMapDetails(map)?.title || AETERNUM_MAP.title;
  return { map: existingMap, nodeId, routeId, world };
};

export const useMap = () => {
  return useRouteParams().map;
};

export const useNodeId = () => {
  return useRouteParams().nodeId;
};

export const useRouteId = () => {
  return useRouteParams().routeId;
};

const getMapView = (searchParams: URLSearchParams) => {
  const x = searchParams.get('x');
  const y = searchParams.get('y');
  const zoom = searchParams.get('zoom');

  if (!x || !y || !zoom) {
    return null;
  }
  return {
    x: +x,
    y: +y,
    zoom: +zoom,
  };
};

export const isEmbed = location.search.includes('embed=true');

const getView = (
  map: string,
  searchParams: URLSearchParams,
  nodeId?: string,
  routeId?: string
) => {
  const searchParamsView = getMapView(searchParams) ?? deserializeMapView(map);

  const existingMap = findMapDetails(map) ? map : AETERNUM_MAP.title;

  return {
    ...searchParamsView,
    map: existingMap,
    nodeId,
    routeId,
  };
};

export const useView = (): {
  view:
    | {
        map: string;
        nodeId?: string;
        routeId?: string;
        y: number;
        x: number;
        zoom: number;
      }
    | {
        map: string;
        nodeId?: string;
        routeId?: string;
        x: null;
        y: null;
        zoom: null;
      };
  setView: (props: { x: number; y: number; zoom: number }) => void;
  toView: (props: { x: number; y: number; zoom: number }) => string;
} => {
  const { map, nodeId, routeId, world } = useRouteParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [internalView, setInternalView] = useState(() =>
    getView(map, searchParams, nodeId, routeId)
  );

  useEffect(() => {
    const view = getView(map, searchParams, nodeId, routeId);
    setInternalView(view);
  }, [map, nodeId, searchParams]);

  useEffect(() => {
    const searchParamsView = getMapView(searchParams);
    if (!searchParamsView) {
      return;
    }

    serializeMapView(map, searchParamsView);
  }, [searchParams]);

  const setView = useCallback(
    (props: { x: number; y: number; zoom: number }) => {
      setInternalView((internalView) => ({ ...internalView, ...props }));
      if ('zoom' in props) {
        serializeMapView(map, {
          x: props.x,
          y: props.y,
          zoom: props.zoom,
        });
      }
    },
    [map, nodeId, routeId, world]
  );

  const toView = useCallback(
    (props: { x: number; y: number; zoom: number }) => {
      const newSearchParams = new URLSearchParams(searchParams);

      newSearchParams.set('x', props.x.toString());
      newSearchParams.set('y', props.y.toString());
      newSearchParams.set('zoom', props.zoom.toString());
      return `${location.pathname}?${newSearchParams.toString()}`;
    },
    [location.pathname, searchParams]
  );

  return { view: internalView, setView, toView };
};
