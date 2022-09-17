import { classNames } from '../../utils/styles';
import EditIcon from '../icons/EditIcon';
import styles from './EditButton.module.css';

type EditButtonProps = {
  className?: string;
  onClick: () => void;
};

function EditButton({ className, onClick }: EditButtonProps): JSX.Element {
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={classNames(styles.button, className)}
      title={`Edit route`}
    >
      <EditIcon />
    </button>
  );
}

export default EditButton;
