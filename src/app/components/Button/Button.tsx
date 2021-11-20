import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
function Button(props: ButtonProps): JSX.Element {
  return <button className={styles.button} {...props} />;
}

export default Button;
