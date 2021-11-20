import styles from './MinimapSetup.module.css';
import { isOverwolfApp } from '../../utils/overwolf';
import MinimapOverwolf from './MinimapOverwolf';
import MinimapWebsite from './MinimapWebsite';

function MinimapSetup(): JSX.Element {
  return (
    <section className={styles.container}>
      {isOverwolfApp ? <MinimapOverwolf /> : <MinimapWebsite />}
    </section>
  );
}

export default MinimapSetup;
