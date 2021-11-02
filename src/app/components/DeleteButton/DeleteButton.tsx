import { useModal } from '../../contexts/ModalContext';
import Confirm from '../Confirm/Confirm';
import DeleteIcon from '../icons/DeleteIcon';
import styles from './DeleteButton.module.css';

type DeleteButtonProps = {
  title: string;
  onClick: () => void;
};
function DeleteButton({ title, onClick }: DeleteButtonProps): JSX.Element {
  const { addModal } = useModal();
  return (
    <button
      className={styles.delete}
      onClick={(event) => {
        event.stopPropagation();
        addModal({
          title,
          children: <Confirm onConfirm={onClick} />,
          fitContent: true,
        });
      }}
      title="Delete"
    >
      <DeleteIcon />
    </button>
  );
}

export default DeleteButton;
