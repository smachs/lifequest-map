import { useAccount } from '../../contexts/UserContext';
import styles from './Footer.module.css';

function Footer() {
  const { account } = useAccount();

  return (
    <footer className={styles.footer}>
      <small>
        {account?.hideAds
          ? 'No ads for you, thx for your support 🤘'
          : 'No Cross-Site trackers and other creepy things'}{' '}
        |{' '}
        <a href="/privacy.html" target="_blank">
          Privacy Policy
        </a>
      </small>
    </footer>
  );
}

export default Footer;
