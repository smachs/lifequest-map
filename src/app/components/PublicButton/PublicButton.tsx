import { useModal } from '../../contexts/ModalContext';
import { classNames } from '../../utils/styles';
import Confirm from '../Confirm/Confirm';
import PrivateIcon from '../icons/PrivateIcon';
import PublicIcon from '../icons/PublicIcon';
import styles from './PublicButton.module.css';

type PublicButtonProps = {
  className?: string;
  isPublic: boolean;
  onClick: () => void;
};

function PublicButton({
  className,
  isPublic,
  onClick,
}: PublicButtonProps): JSX.Element {
  const { addModal } = useModal();
  const newVisibility = isPublic ? 'private' : 'public';

  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        addModal({
          title: `Do you really want to change the visibility to ${newVisibility}?`,
          children: <Confirm onConfirm={onClick} />,
          fitContent: true,
        });
      }}
      className={classNames(styles.button, className)}
      title={`Change visibility to ${newVisibility}`}
    >
      {isPublic ? <PublicIcon /> : <PrivateIcon />}
    </button>
  );
}

export default PublicButton;
