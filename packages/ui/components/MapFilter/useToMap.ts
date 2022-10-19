import { mapIsAeternumMap } from 'static';
import type { Section } from '../../utils/routes';
import { useView } from '../../utils/routes';

const toMap = (title: string, section: Section) => {
  let to = mapIsAeternumMap(title) ? '/' : `/${title}`;
  if (section !== 'nodes') {
    if (!to.endsWith('/')) {
      to += '/';
    }
    to += `?section=${section}`;
  }
  return to;
};

const useToMap = () => {
  const { view } = useView();

  return (title: string) => toMap(title, view.section);
};

export default useToMap;
