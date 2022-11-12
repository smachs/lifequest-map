import { classNames } from '../../utils/styles';
import type { LiveServer } from './liveServers';
import styles from './ServerRadioButton.module.css';

type ServerRadioButtonProps = {
  server: LiveServer;
  checked: boolean;
  onChange: (value: string) => void;
};
function ServerRadioButton({
  server,
  checked,
  onChange,
}: ServerRadioButtonProps) {
  return (
    <label className={classNames(styles.label, checked && styles.checked)}>
      <input
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
