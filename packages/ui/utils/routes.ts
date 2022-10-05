import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { mapDetails } from 'static';
import { deserializeMapView, serializeMapView } from './storage';

export const useRouteParams = () => {
  const { map = mapDetails[0].name, nodeId, routeId } = useParams();
  return { map, nodeId, routeId };
};

export const useMap = () => {
  return useRouteParams().map;
};

const getSearchParamsView = (searchParams: URLSearchParams) => {
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

const getView = (map: string, searchParams: URLSearchParams) => {
  const searchParamsView =
    getSearchParamsView(searchParams) ?? deserializeMapView(map);
  return { ...searchParamsView, map };
};

export const useView = (): [
  (
    | {
        map: string;
        y: number;
        x: number;
        zoom: number;
      }
    | { map: string; x: null; y: null; zoom: null }
  ),
  (x: number, y: number, zoom: number) => void
] => {
  const map = useMap();
  const [searchParams, setSearchParams] = useSearchParams();

  const [internalView, setInternalView] = useState(() =>
    getView(map, searchParams)
  );

  useEffect(() => {
    const view = getView(map, searchParams);
    setInternalView(view);
  }, [map]);

  useEffect(() => {
    if (!internalView.x) {
      return;
    }
    setSearchParams(
      {
        ...searchParams,
        x: internalView.x.toString(),
        y: internalView.y.toString(),
        zoom: internalView.zoom.toString(),
      },
      { replace: true }
    );
  }, [internalView]);

  useEffect(() => {
    const searchParamsView = getSearchParamsView(searchParams);
    if (!searchParamsView) {
      return;
    }

    serializeMapView(map, searchParamsView);
  }, [searchParams]);

  const setView = (x: number, y: number, zoom: number) => {
    setInternalView({ map, x, y, zoom });
    setSearchParams(
      {
        ...searchParams,
        x: x.toString(),
        y: y.toString(),
        zoom: zoom.toString(),
      },
      { replace: true }
    );
  };

  return [internalView, setView];
};
