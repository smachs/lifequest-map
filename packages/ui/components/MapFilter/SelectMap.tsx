import { mapDetails } from 'static';
import styles from './MarkersView.module.css';
import { useNavigate } from 'react-router-dom';
import { useMap } from 'ui/utils/routes';

const SelectMap = () => {
  const map = useMap();
  const navigate = useNavigate();

  return (
    <div className={styles.actions}>
      <select
        onChange={(event) =>
          navigate(
            event.target.value.toLowerCase() === 'aeternum map'
              ? '/'
              : `/${event.target.value}`
          )
        }
        id="map"
        aria-label="Select map"
        name="map"
        defaultValue={map}
      >
        {mapDetails.map((mapDetail) => (
          <option key={mapDetail.name} value={mapDetail.title}>
            {mapDetail.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectMap;
