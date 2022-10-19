import { useEffect, useState } from 'react';
import { NEW_WORLD_CLASS_ID } from 'ui/utils/games';

const useOverlayActivated = () => {
  const [isActivated, setIsActivated] = useState(true);

  useEffect(() => {
    overwolf.settings.games.getOverlayEnabled(NEW_WORLD_CLASS_ID, (event) =>
      setIsActivated(event.enabled)
    );

    const handleOverlayEnablementChanged = (
      event: overwolf.settings.games.OverlayEnablementChangedEvent
    ) => {
      if (event.gameId === NEW_WORLD_CLASS_ID) {
        setIsActivated(event.enabled);
      }
    };

    overwolf.settings.games.onOverlayEnablementChanged.addListener(
      handleOverlayEnablementChanged
    );

    return () => {
      overwolf.settings.games.onOverlayEnablementChanged.removeListener(
        handleOverlayEnablementChanged
      );
    };
  }, []);

  return isActivated;
};

export default useOverlayActivated;
