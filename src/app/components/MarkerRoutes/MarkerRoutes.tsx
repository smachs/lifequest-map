import { useModal } from '../../contexts/ModalContext';
import ActionButton from '../ActionControl/ActionButton';
import styles from './MarkerRoutes.module.css';
import NewMarkerRoute from './NewMarkerRoute';

function MarkerRoutes(): JSX.Element {
  const { addModal } = useModal();
  return (
    <section>
      <div className={styles.actions}>
        <ActionButton
          onClick={() => {
            addModal({
              title: 'New Route',
              children: <NewMarkerRoute />,
            });
          }}
        >
          New route
        </ActionButton>
      </div>
    </section>
  );
}

export default MarkerRoutes;
