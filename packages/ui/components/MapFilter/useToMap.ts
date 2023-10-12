import { mapIsAeternumMap } from 'static';

const toMap = (title: string) => {
  const to = mapIsAeternumMap(title) ? '/' : `/${title}`;

  return to;
};

const useToMap = () => {
  return (title: string) => toMap(title);
};

export default useToMap;
