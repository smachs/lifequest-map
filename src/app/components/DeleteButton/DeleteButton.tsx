import DeleteIcon from '../icons/DeleteIcon';
import styles from './DeleteButton.module.css';

type DeleteButtonProps = {
  onClick: () => void;
};
function DeleteButton({ onClick }: DeleteButtonProps): JSX.Element {
  return (
    <button className={styles.delete} onClick={onClick} title="Delete">
      <DeleteIcon />
    </button>
  );
}

export default DeleteButton;
