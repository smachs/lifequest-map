import Loading from '../../Loading/Loading';
import useNewWorldFansLoot from './useNewWorldFansLoot';
import styles from './Loot.module.css';
import { classNames } from '../../../utils/styles';

type LootProps = {
  name: string;
  className: string;
};
function Loot({ name, className }: LootProps) {
  const { isLoading, items } = useNewWorldFansLoot(name);

  return (
    <div className={className}>
      <h3>Loot</h3>
      {isLoading && <Loading />}
      {!isLoading && !items && <p className={styles.notFound}>No loot found</p>}
      {!isLoading && items && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li
              key={item.item_id}
              className={classNames(styles.item, styles[item.rarity])}
            >
              <img
                className={styles.icon}
                src={item.asset_path.replace(
                  'items_hires',
                  item.item_type.toLowerCase()
                )}
                alt=""
              />
              <span className={styles.name}>{item.name}</span>
              {item.max_gear_score > 0 && (
                <>
                  {item.min_gear_score !== item.max_gear_score ? (
                    <span>
                      {item.min_gear_score}-{item.max_gear_score} GS
                    </span>
                  ) : (
                    <span>{item.max_gear_score} GS</span>
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
