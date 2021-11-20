import styles from './ShareLiveStatus.module.css';

type ShareLiveStatusProps = {
  onActivate: () => void;
};
function ShareLiveStatus({ onActivate }: ShareLiveStatusProps): JSX.Element {
  return (
    <section className={styles.container}>
      <p>
        You can share you live status including position and character name with
        other applications 🤘.
      </p>
      <h4>Applications</h4>
      <p>
        <a href="https://aeternum-map.gg" target="_blank">
          https://aeternum-map.gg
        </a>{' '}
        is an interactive New World map with routes and community managed
        markers.
      </p>
      <ul>
        <li>🚀 Live Tracking of your In-Game position</li>
        <li>🔀 Farming/Marker Routes</li>
        <li>✅ Check markers as done (like lore documents)</li>
        <li>
          🗺️ Minimap view (with support of{' '}
          <a href="https://github.com/LorenzCK/OnTopReplica" target="_blank">
            OnTopReplica
          </a>
          )
        </li>
        <li>
          🤷‍♂️ Amazon ToS conform, because it's a website, not an app. See{' '}
          <a
            href="https://discord.com/channels/320539672663031818/896014490808745994/911185526210576394"
            target="_blank"
          >
            announcement in Discord
          </a>
          .
        </li>
      </ul>

      <p>
        If you like to build your own applications based on your live status,
        make sure to{' '}
        <a href="https://discord.gg/NTZu8Px" target="_blank">
          Join Discord Community
        </a>
        .
      </p>
      <button className={styles.button} onClick={onActivate}>
        Share Live Status
      </button>
    </section>
  );
}

export default ShareLiveStatus;
