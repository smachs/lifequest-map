import { Button } from '@mantine/core';
import { IconFlag } from '@tabler/icons';
import { useParams } from 'react-router-dom';
import { isEmbed } from '../../utils/routes';
import useInfluenceMap from './useInfluenceMap';

const InfluenceDetails = () => {
  const { world: publicName } = useParams();

  useInfluenceMap(publicName);

  if (isEmbed) {
    if (!publicName) {
      return <></>;
    }
    return (
      <Button
        variant="default"
        component="a"
        href={`https://aeternum-map.gg/influences/${publicName}?section=influences`}
        target="_blank"
        leftIcon={<IconFlag />}
        radius="xl"
      >
        {publicName}
      </Button>
    );
  }

  return <></>;
};

export default InfluenceDetails;
