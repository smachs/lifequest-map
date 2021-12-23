import { useEffect, useState } from 'react';
import { classNames } from '../../utils/styles';
import type { LiveServer } from './liveServers';
import { ping } from './liveServers';
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
  const [delay, setDelay] = useState<number | null>(null);

  useEffect(() => {
    ping(server).then(setDelay);

    const intervalId = setInterval(() => {
      ping(server).then(setDelay);
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <label className={classNames(styles.label, checked && styles.checked)}>
      <input
        disabled={disabled}
        type="radio"
        name="server"
        value={server.url}
        checked={checked}
        onChange={(event) => onChange(event.target.value)}
      />{' '}
      {server.name}{' '}
      {delay && (delay === Infinity ? '(Offline)' : `(${delay}ms)`)}
    </label>
  );
}

export default ServerRadioButton;
