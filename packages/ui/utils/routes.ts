import { useParams } from 'react-router-dom';
import { mapDetails } from 'static';

export const useRouteParams = () => {
  const { map = mapDetails[0].name, nodeId, routeId } = useParams();
  return { map, nodeId, routeId };
};

export const useMap = () => {
  return useRouteParams().map;
};
