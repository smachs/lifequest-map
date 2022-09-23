import { usePlayer } from '../../contexts/PlayerContext';
import type { Position } from '../../utils/useReadLivePosition';
import Button from '../Button/Button';
import PlayerIcon from '../icons/PlayerIcon';
import styles from './PlayerPositionButton.module.css';

type PlayerPositionButtonProps = {
  onClick: (position: Position) => void;
};
function PlayerPositionButton({ onClick }: PlayerPositionButtonProps) {
  const { player } = usePlayer();

  return (
    <Button
      className={styles.playerPosition}
      disabled={!player || !player.position}
      onClick={() => onClick(player!.position!)}
    >
      <PlayerIcon />
      Use player position
    </Button>
  );
}

export default PlayerPositionButton;
