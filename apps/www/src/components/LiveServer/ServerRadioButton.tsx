import { classNames } from '../../utils/styles';
import type { LiveServer } from './liveServers';
import styles from './ServerRadioButton.module.css';

type ServerRadioButtonProps = {
  server: LiveServer;
  checked: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
};
function ServerRadioButton({
  server,
  checked,
  disabled,
  onChange,
}: ServerRadioButtonProps) {
  return (
    <label
      className={classNames(
        styles.label,
        checked && styles.checked,
        disabled && styles.disabled
      )}
    >
      <input
        disabled={disabled}
        type="radio"
        name="server"
        value={server.url}
        checked={checked}
        onChange={(event) => onChange(event.target.value)}
      />{' '}
      {server.name} {!server.delay ? '(Offline)' : `(${server.delay}ms)`}
    </label>
  );
}

export default ServerRadioButton;
