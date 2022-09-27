import Loading from '../../Loading/Loading';
import useLoot from './useLoot';
import styles from './Loot.module.css';
import { classNames } from '../../../utils/styles';

type LootProps = {
  markerId: string;
  className: string;
};
function Loot({ markerId, className }: LootProps) {
  const { isLoading, items } = useLoot(markerId);

  return (
    <div className={className}>
      <h3>Loot</h3>
      {isLoading && <Loading />}
      {!isLoading && !items && <p className={styles.notFound}>No loot found</p>}
      {!isLoading && items && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li
              key={item.id}
              className={classNames(styles.item, styles[item.rarity])}
            >
              <img className={styles.icon} src={item.iconSrc} alt="" />
              <span className={styles.name}>{item.name}</span>
              {item.maxGearScore > 0 && (
                <>
                  {item.minGearScore !== item.maxGearScore ? (
                    <span>
                      {item.minGearScore}-{item.maxGearScore} GS
                    </span>
                  ) : (
                    <span>{item.maxGearScore} GS</span>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Loot;
