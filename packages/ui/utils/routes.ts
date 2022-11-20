import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AETERNUM_MAP, findMapDetails, mapDetails } from 'static';
import { deserializeMapView, serializeMapView } from './storage';

export type Section = 'nodes' | 'routes' | 'settings';
export const SECTIONS: Section[] = ['nodes', 'routes', 'settings'];

export const useRouteParams = () => {
  const { map = mapDetails[0].title, nodeId, routeId } = useParams();
  const existingMap = findMapDetails(map) ? map : AETERNUM_MAP.title;

  return { map: existingMap, nodeId, routeId };
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

const getView = (
  map: string,
  searchParams: URLSearchParams,
  nodeId?: string,
  routeId?: string
) => {
  const searchParamsView = getMapView(searchParams) ?? deserializeMapView(map);
  const sectionParam = searchParams.get('section');
  const section: Section =
    !sectionParam || !SECTIONS.includes(sectionParam as Section)
      ? 'nodes'
      : (sectionParam as Section);

  const existingMap = findMapDetails(map) ? map : AETERNUM_MAP.title;

  return { ...searchParamsView, map: existingMap, nodeId, routeId, section };
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
        section: Section;
      }
    | {
        map: string;
        nodeId?: string;
        routeId?: string;
        x: null;
        y: null;
        zoom: null;
        section: Section;
      };
  setView: (
    props: { x: number; y: number; zoom: number } | { section: Section }
  ) => void;
  toView: (
    props:
      | {
          x: number;
          y: number;
          zoom: number;
        }
      | {
          section: Section;
        }
  ) => string;
} => {
  const { map, nodeId, routeId } = useRouteParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [internalView, setInternalView] = useState(() =>
    getView(map, searchParams, nodeId, routeId)
  );

  useEffect(() => {
    const view = getView(map, searchParams, nodeId, routeId);
    setInternalView(view);
  }, [map, nodeId, searchParams]);

  useEffect(() => {
    if (!internalView.x) {
      setSearchParams((searchParams) => ({
        ...searchParams,
        section: internalView.section,
      }));
    } else {
      serializeMapView(map, {
        x: internalView.x,
        y: internalView.y,
        zoom: internalView.zoom,
      });
    }
  }, [internalView]);

  useEffect(() => {
    const searchParamsView = getMapView(searchParams);
    if (!searchParamsView) {
      return;
    }

    serializeMapView(map, searchParamsView);
  }, [searchParams]);

  const setView = useCallback(
    (props: { x: number; y: number; zoom: number } | { section: Section }) => {
      setInternalView((internalView) => ({ ...internalView, ...props }));
    },
    []
  );

  const toView = useCallback(
    (props: { x: number; y: number; zoom: number } | { section: Section }) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if ('section' in props) {
        newSearchParams.set('section', props.section);
      } else {
        newSearchParams.set('x', props.x.toString());
        newSearchParams.set('y', props.y.toString());
        newSearchParams.set('zoom', props.zoom.toString());
      }
      return `${location.pathname}?${newSearchParams.toString()}`;
    },
    [location.pathname, searchParams]
  );

  return { view: internalView, setView, toView };
};
