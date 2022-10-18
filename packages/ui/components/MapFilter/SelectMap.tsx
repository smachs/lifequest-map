import { mapDetails } from 'static';
import styles from './MarkersView.module.css';
import { Link } from 'react-router-dom';
import { useMap } from 'ui/utils/routes';
import { Button, Menu } from '@mantine/core';
import useToMap from './useToMap';

const SelectMap = () => {
  const map = useMap();
  const toMap = useToMap();

  return (
    <div className={styles.actions}>
      <Menu>
        <Menu.Target>
          <Button variant="outline">{map}</Button>
        </Menu.Target>

        <Menu.Dropdown>
          {mapDetails.map((mapDetail) => (
            <Menu.Item
              key={mapDetail.name}
              component={Link}
              to={toMap(mapDetail.title)}
            >
              {mapDetail.title}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

export default SelectMap;
