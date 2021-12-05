import { useIsNewWorldRunning } from '../utils/games';
import { classNames } from '../utils/styles';
import {
  closeMainWindow,
  dragMoveWindow,
  getCurrentWindow,
  minimizeCurrentWindow,
  togglePreferedWindow,
  WINDOWS,
} from '../utils/windows';
import CloseIcon from '../components/icons/CloseIcon';
import DiscordIcon from '../components/icons/DiscordIcon';
import GitHubIcon from '../components/icons/GitHubIcon';
import MinimizeIcon from '../components/icons/MinimizeIcon';
import MonitorIcon from '../components/icons/MonitorIcon';
import classes from './AppHeader.module.css';

function AppHeader(): JSX.Element {
  const isNewWorldRunning = useIsNewWorldRunning();

  async function openExternalLink(url: string) {
    const currentWindow = await getCurrentWindow();
    if (currentWindow.name === WINDOWS.OVERLAY) {
      overwolf.utils.openUrlInOverwolfBrowser(url);
    } else {
      overwolf.utils.openUrlInDefaultBrowser(url);
    }
  }

  return (
    <header className={classes.header} onMouseDown={dragMoveWindow}>
      <img src="/icon.png" alt="" className={classes.logo} />
      <h1 className={classes.title}>Aeternum Map</h1>

      <div className={classes.controls}>
        <button
          className={classNames(classes.button, classes['button--github'])}
          title="Open Source on GitHub"
          onClick={() =>
            openExternalLink('https://github.com/lmachens/aeternum-map')
          }
        >
          <GitHubIcon />
        </button>
        <button
          className={classes.button}
          title="Join Discord Community"
          onClick={() => openExternalLink('https://discord.gg/NTZu8Px')}
        >
          <DiscordIcon />
        </button>
        <button
          className={classes.button}
          onClick={togglePreferedWindow}
          title={'Toggle Desktop/Overlay'}
          disabled={!isNewWorldRunning}
        >
          <MonitorIcon />
        </button>
        <button
          className={classNames(classes.button, classes['button--padded'])}
          onClick={minimizeCurrentWindow}
        >
          <MinimizeIcon />
        </button>
        <button
          className={classNames(
            classes.button,
            classes['button--padded'],
            classes['button--danger']
          )}
          onClick={closeMainWindow}
        >
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
