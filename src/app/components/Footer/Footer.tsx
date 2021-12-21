import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <small>
        No Cross-Site trackers and other creepy things |{' '}
        <a href="/privacy.html" target="_blank">
          Privacy Policy
        </a>
      </small>
    </footer>
  );
}

export default Footer;
