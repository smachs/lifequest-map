import { useModal } from '../../contexts/ModalContext';
import styles from './Confirm.module.css';

type ConfirmProps = {
  onConfirm: () => void;
};

function Confirm({ onConfirm }: ConfirmProps): JSX.Element {
  const { closeLatestModal } = useModal();

  return (
    <div className={styles.container}>
      <button
        onClick={() => {
          onConfirm();
          closeLatestModal();
        }}
      >
        Yes
      </button>
      <button onClick={closeLatestModal}>No</button>
    </div>
  );
}

export default Confirm;
