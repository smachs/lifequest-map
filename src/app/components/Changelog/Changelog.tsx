import { Fragment, useEffect, useState } from 'react';
import Markdown from '../Markdown/Markdown';
import { getAppVersion } from '../../utils/extensions';
import styles from './Changelog.module.css';
import { writeError } from '../../utils/logs';

type Release = {
  id: number;
  name: string;
  body: string;
  prerelease: boolean;
  published_at: string;
};
function Changelog(): JSX.Element {
  const [releases, setReleases] = useState<Release[]>([]);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    try {
      getAppVersion().then(setAppVersion);
      fetch('https://api.github.com/repos/lmachens/aeternum-map/releases')
        .then((response) => response.json())
        .then((releases: Release[]) =>
          releases.filter((release) => !release.prerelease)
        )
        .then(setReleases);
    } catch (error) {
      writeError(error);
    }
  }, []);

  return (
    <>
      <p>Your version: {appVersion}</p>
      <section className={styles.section}>
        {releases.map((release) => (
          <Fragment key={release.id}>
            <hr className={styles.hr} />
            <h2 className={styles.h2}>{release.name}</h2>
            <aside className={styles.aside}>
              {new Date(release.published_at).toLocaleDateString()}
            </aside>
            {release.body ? (
              <Markdown>{release.body}</Markdown>
            ) : (
              <p>No details 😞</p>
            )}
          </Fragment>
        ))}
      </section>
    </>
  );
}

export default Changelog;
