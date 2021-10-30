import { classNames } from '../../utils/styles';
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
  return (
    <button
      onClick={onClick}
      className={classNames(styles.button, className)}
      title={isPublic ? 'Public' : 'Private'}
    >
      {isPublic ? <PublicIcon /> : <PrivateIcon />}
    </button>
  );
}

export default PublicButton;
