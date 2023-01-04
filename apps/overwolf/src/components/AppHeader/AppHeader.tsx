import { Box } from '@mantine/core';
import { IconHelp } from '@tabler/icons';
import { useState } from 'react';
import FAQModal from 'ui/components/FAQ/FAQModal';
import CloseIcon from 'ui/components/icons/CloseIcon';
import DiscordIcon from 'ui/components/icons/DiscordIcon';
import GitHubIcon from 'ui/components/icons/GitHubIcon';
import MinimizeIcon from 'ui/components/icons/MinimizeIcon';
import { classNames } from 'ui/utils/styles';
import {
  closeMainWindow,
  dragMoveWindow,
  minimizeCurrentWindow,
} from 'ui/utils/windows';
import classes from './AppHeader.module.css';

async function openExternalLink(url: string) {
  overwolf.utils.openUrlInDefaultBrowser(url);
}

function AppHeader(): JSX.Element {
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <Box
      component="header"
      sx={(theme) => ({
        background: theme.colors.dark[6],
      })}
      className={classes.header}
      onMouseDown={dragMoveWindow}
    >
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
          className={classes.button}
          title="FAQ"
          onClick={() => setShowFAQ(true)}
        >
          <IconHelp />
        </button>
        <FAQModal opened={showFAQ} onClose={() => setShowFAQ(false)} />
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
    </Box>
  );
}

export default AppHeader;
