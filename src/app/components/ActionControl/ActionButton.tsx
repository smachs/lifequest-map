import { classNames } from '../../utils/styles';
import styles from './ActionControl.module.css';

function ActionButton({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>): JSX.Element {
  return <button className={classNames(styles.action, className)} {...props} />;
}

export default ActionButton;
