import { classNames } from '../../utils/styles';
import styles from './Avatar.module.css';

type AvatarProps = {
  src: string;
  alt: string;
  className?: string;
};

function Avatar({ src, alt, className }: AvatarProps): JSX.Element {
  return (
    <img className={classNames(styles.avatar, className)} src={src} alt={alt} />
  );
}

export default Avatar;
