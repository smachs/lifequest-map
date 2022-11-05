import { trackOutboundLinkClick } from '../../utils/stats';
import { classNames } from '../../utils/styles';
import FAQ from '../FAQ/FAQ';
import DiscordIcon from '../icons/DiscordIcon';
import GitHubIcon from '../icons/GitHubIcon';
import classes from './AppHeader.module.css';

type AppHeaderProps = {
  className?: string;
};

function AppHeader({ className }: AppHeaderProps): JSX.Element {
  return (
    <header className={classNames(classes.header, className)}>
      <img src="/icon.png" alt="" className={classes.logo} />
      <h1 className={classes.title}>Aeternum-Map.gg</h1>

      <div className={classes.controls}>
        <a
          className={classNames(classes.button, classes['button--github'])}
          title="Open Source on GitHub"
          href="https://github.com/lmachens/aeternum-map"
          target="_blank"
          onClick={() =>
            trackOutboundLinkClick('https://github.com/lmachens/aeternum-map')
          }
        >
          <GitHubIcon />
        </a>
        <a
          className={classes.button}
          title="Join Discord Community"
          href="https://discord.gg/NTZu8Px"
          target="_blank"
          onClick={() => trackOutboundLinkClick('https://discord.gg/NTZu8Px')}
        >
          <DiscordIcon />
        </a>
        <FAQ />
      </div>
    </header>
  );
}

export default AppHeader;
