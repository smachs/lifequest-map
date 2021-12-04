import { useEffect } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { isAppUpdated } from '../../utils/extensions';
import { useIsNewWorldRunning } from '../../utils/games';
import { isOverwolfApp } from '../../utils/overwolf';
import { getJSONItem } from '../../utils/storage';
import { classNames } from '../../utils/styles';
import {
  closeMainWindow,
  dragMoveWindow,
  getCurrentWindow,
  minimizeCurrentWindow,
  togglePreferedWindow,
  WINDOWS,
} from '../../utils/windows';
import Changelog from '../Changelog/Changelog';
import CloseIcon from '../icons/CloseIcon';
import DiscordIcon from '../icons/DiscordIcon';
import GitHubIcon from '../icons/GitHubIcon';
import HelpIcon from '../icons/HelpIcon';
import MinimizeIcon from '../icons/MinimizeIcon';
import MonitorIcon from '../icons/MonitorIcon';
import classes from './AppHeader.module.css';

type AppHeaderProps = {
  className?: string;
};

function AppHeader({ className }: AppHeaderProps): JSX.Element {
  const isNewWorldRunning = useIsNewWorldRunning();
  const { addModal } = useModal();

  useEffect(() => {
    isAppUpdated().then((isUpdated) => {
      const changelogUpdates = getJSONItem('changelogUpdates', true);
      if (isUpdated && changelogUpdates) {
        addModal({
          title: 'Changelog',
          children: <Changelog />,
        });
      }
    });
  }, []);

  async function openExternalLink(url: string) {
    if (!isOverwolfApp) {
      window.open(url, '_blank');
      return;
    }
    const currentWindow = await getCurrentWindow();
    if (currentWindow.name === WINDOWS.OVERLAY) {
      overwolf.utils.openUrlInOverwolfBrowser(url);
    } else {
      overwolf.utils.openUrlInDefaultBrowser(url);
    }
  }

  return (
    <header
      className={classNames(classes.header, className)}
      onMouseDown={dragMoveWindow}
    >
      <img src="/icon.png" alt="" className={classes.logo} />
      <h1 className={classes.title}>Aeternum Map</h1>

      <div className={classes.controls}>
        <button
          className={classNames(classes.button, classes['button--github'])}
          data-tooltip="Open Source on GitHub"
          onClick={() =>
            openExternalLink('https://github.com/lmachens/aeternum-map')
          }
        >
          <GitHubIcon />
        </button>
        <button
          className={classes.button}
          data-tooltip="Join Discord Community"
          onClick={() => openExternalLink('https://discord.gg/NTZu8Px')}
        >
          <DiscordIcon />
        </button>
        {isOverwolfApp && (
          <button
            className={classes.button}
            onClick={togglePreferedWindow}
            data-tooltip={'Toggle Desktop/Overlay'}
            disabled={!isNewWorldRunning}
          >
            <MonitorIcon />
          </button>
        )}
        {!isOverwolfApp && (
          <button
            className={classes.button}
            onClick={() =>
              addModal({
                title: 'Changelog',
                children: <Changelog />,
              })
            }
            data-tooltip={'Changelog'}
          >
            <HelpIcon />
          </button>
        )}
        {isOverwolfApp && (
          <>
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
          </>
        )}
      </div>
    </header>
  );
}

export default AppHeader;
