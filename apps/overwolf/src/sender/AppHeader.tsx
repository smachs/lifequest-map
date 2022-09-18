import { classNames } from 'ui/utils/styles';
import {
  closeMainWindow,
  dragMoveWindow,
  minimizeCurrentWindow,
} from 'ui/utils/windows';
import CloseIcon from 'ui/components/icons/CloseIcon';
import DiscordIcon from 'ui/components/icons/DiscordIcon';
import GitHubIcon from 'ui/components/icons/GitHubIcon';
import MinimizeIcon from 'ui/components/icons/MinimizeIcon';
import classes from './AppHeader.module.css';

function AppHeader(): JSX.Element {
  async function openExternalLink(url: string) {
    overwolf.utils.openUrlInDefaultBrowser(url);
  }

  return (
    <header className={classes.header} onMouseDown={dragMoveWindow}>
      <img src="/icon.png" alt="" className={classes.logo} />
      <h1 className={classes.title}>Aeternum-Map.gg</h1>

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
