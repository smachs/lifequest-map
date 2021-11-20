import {
  SETUP_MINIMAP,
  SHOW_HIDE_MINIMAP,
  useHotkeyBinding,
  ZOOM_IN_MINIMAP,
  ZOOM_OUT_MINIMAP,
} from '../../utils/hotkeys';
import styles from './MinimapSetup.module.css';
import videoSrc from './minimap-setup.mp4';

function MinimapOverwolf(): JSX.Element {
  const setupHotkeyBinding = useHotkeyBinding(SETUP_MINIMAP);
  const showHideHotkeyBinding = useHotkeyBinding(SHOW_HIDE_MINIMAP);
  const zoomInHotkeyBinding = useHotkeyBinding(ZOOM_IN_MINIMAP);
  const zoomOutHotkeyBinding = useHotkeyBinding(ZOOM_OUT_MINIMAP);

  return (
    <>
      <p>The minimap is displayed as Overlay in-game 🤘.</p>
      <p>
        If you use the second screen mode, make sure to focus New World to see
        it.
        <br />
        You can style, pan and rescale it by pressing{' '}
        <span className={styles.hotkey}>{setupHotkeyBinding}</span> in-game. You
        have to be in a New World menu (press ESC) to gain control of the mouse
        cursor!
        <br />
        Use <span className={styles.hotkey}>{showHideHotkeyBinding}</span> to
        hide/show the minimap, which takes a few seconds to start.
        <br />
        <span className={styles.hotkey}>{zoomInHotkeyBinding}</span> will zoom
        in, <span className={styles.hotkey}>{zoomOutHotkeyBinding}</span> zooms
        out.
      </p>
      <video className={styles.video} src={videoSrc} autoPlay loop />
    </>
  );
}

export default MinimapOverwolf;
