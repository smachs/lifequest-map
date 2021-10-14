import {
  SETUP_MINIMAP,
  SHOW_HIDE_MINIMAP,
  useHotkeyBinding,
} from '../../utils/hotkeys';
import styles from './MinimapSetup.module.css';
import videoSrc from './minimap-setup.mp4';

function MinimapSetup(): JSX.Element {
  const setupHotkeyBinding = useHotkeyBinding(SETUP_MINIMAP);
  const showHideHotkeyBinding = useHotkeyBinding(SHOW_HIDE_MINIMAP);

  return (
    <section className={styles.container}>
      <p>The minimap is displayed as Overlay in-game 🤘.</p>
      <p>
        If you use the second screen mode, make sure to focus New World to see
        it.
        <br />
        You can style, pan and rescale it by pressing{' '}
        <span className={styles.hotkey}>{setupHotkeyBinding}</span> in-game.
        <br />
        Use <span className={styles.hotkey}>{showHideHotkeyBinding}</span> to
        hide/show the minimap, which takes a few seconds to start.
        <br />
        You have to be in a New World menu (press ESC) to gain control of the
        mouse cursor!
      </p>
      <video className={styles.video} src={videoSrc} autoPlay loop />
    </section>
  );
}

export default MinimapSetup;
