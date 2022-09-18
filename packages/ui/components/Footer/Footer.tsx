import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <small>
        <a
          href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
          title="Aeternum Map Companion"
          target="_blank"
        >
          Overwolf App
        </a>
        |
        <a
          href="https://www.arkesia.gg/"
          title="Interactive map for Lost Ark"
          target="_blank"
        >
          Arkesia.gg
        </a>
        |
        <a
          href="https://th.gl/"
          title="Trophies app for League of Legends"
          target="_blank"
        >
          Trophy Hunter
        </a>
        |
        <a
          href="https://www.soc.gg/"
          title="A Songs of Conquest fansite"
          target="_blank"
        >
          SoC.gg
        </a>
        |
        <a
          href="https://github.com/lmachens/skeleton"
          title="Simply display any website as customizable Overlay"
          target="_blank"
        >
          Skeleton
        </a>
        |
        <a href="/privacy.html" target="_blank">
          Privacy Policy
        </a>
      </small>
    </footer>
  );
}

export default Footer;
