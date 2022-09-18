import styles from './MinimapSetup.module.css';
import MinimapWebsite from './MinimapWebsite';

function MinimapSetup(): JSX.Element {
  return (
    <section className={styles.container}>
      <MinimapWebsite />
    </section>
  );
}

export default MinimapSetup;
