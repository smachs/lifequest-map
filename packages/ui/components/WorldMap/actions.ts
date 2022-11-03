import type { User } from '../../contexts/UserContext';
import { notify } from '../../utils/notifications';
import { patchUser } from '../MarkerDetails/api';
import type CanvasMarker from './CanvasMarker';
import styles from './WorldMap.module.css';
import { toast } from 'react-toastify';
import leaflet from 'leaflet';
import { latestLeafletMap } from './useWorldMap';
import type { MarkerSize } from 'static';
import { getWorld, getZone } from 'static';
import { usePlayerStore } from '../../utils/playerStore';

const format = (value: number) => `0${Math.floor(value)}`.slice(-2);
const formatTimer = (seconds: number) => {
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  if (hours >= 1) {
    return [hours, minutes, seconds % 60].map(format).join(':');
  }
  return [minutes, seconds % 60].map(format).join(':');
};
const respawnAction =
  (typeRespawnTimer?: number) => async (marker: CanvasMarker) => {
    const respawnTimer = marker.customRespawnTimer || typeRespawnTimer;
    if (!respawnTimer) {
      return;
    }
    if (marker.actionHandle) {
      clearTimeout(marker.actionHandle);
      delete marker.actionHandle;
      if (marker.popup) {
        marker.popup.remove();
      }
    }
    const respawnAt = Date.now() + 1000 * respawnTimer;

    marker.popup = leaflet
      .popup({
        autoPan: false,
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        keepInView: false,
        className: styles.respawn,
      })
      .setLatLng(marker.getLatLng());
    latestLeafletMap!.addLayer(marker.popup);

    const updateTimer = () => {
      if (!marker || !marker.popup) {
        return;
      }
      const timeLeft = Math.round((respawnAt - Date.now()) / 1000);
      marker.popup.setContent(`${formatTimer(timeLeft)}`);
      if (timeLeft > 0) {
        marker.actionHandle = setTimeout(updateTimer, 1000);
      } else {
        marker.popup.remove();
        delete marker.actionHandle;
      }
    };
    updateTimer();
  };

const respawnWorldAction =
  (respawnHour: number) => async (marker: CanvasMarker) => {
    let timeZone: string | undefined = undefined;
    const worldName = usePlayerStore.getState().player?.worldName;
    if (worldName) {
      const world = getWorld(worldName);
      const zone = world && getZone(world.zone);
      if (zone) {
        timeZone = zone.timeZone;
      }
    }
    const timeString = new Date().toLocaleTimeString('en-US', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const hoursLeft = (respawnHour + 24 - 1 - hours) % 24;
    const minutesLeft = 60 - minutes;
    const secondsLeft = 60 - seconds;

    const respawnAt =
      Date.now() +
      1000 * secondsLeft +
      60000 * minutesLeft +
      3600000 * hoursLeft;

    if (marker.actionHandle) {
      clearTimeout(marker.actionHandle);
      delete marker.actionHandle;
      if (marker.popup) {
        marker.popup.remove();
      }
    }

    if (marker.actionHandle) {
      clearTimeout(marker.actionHandle);
      delete marker.actionHandle;
      if (marker.popup) {
        marker.popup.remove();
      }
    }

    marker.popup = leaflet
      .popup({
        autoPan: false,
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        keepInView: false,
        className: styles.respawn,
      })
      .setLatLng(marker.getLatLng());
    latestLeafletMap!.addLayer(marker.popup);

    const updateTimer = () => {
      if (!marker || !marker.popup) {
        return;
      }
      const timeLeft = Math.round((respawnAt - Date.now()) / 1000);
      marker.popup.setContent(`${formatTimer(timeLeft)}`);
      if (timeLeft > 0) {
        marker.actionHandle = setTimeout(updateTimer, 1000);
      } else {
        marker.popup.remove();
        delete marker.actionHandle;
      }
    };
    updateTimer();
  };

const sizes: {
  [key in MarkerSize]: number;
} = {
  XS: 0,
  S: 1,
  M: 2,
  L: 3,
  XL: 4,
  '?': 1,
};

const respawnSizeAction =
  (timers: [number, number, number, number, number]) =>
  (marker: CanvasMarker) => {
    if (!marker.options.image.markerSize) {
      return;
    }
    const size = sizes[marker.options.image.markerSize];
    const timer = timers[size];
    return respawnAction(timer)(marker);
  };

const hideMarker = async (
  marker: CanvasMarker,
  user: User | null,
  refreshUser: () => void
) => {
  if (!user) {
    toast.warn('User not detected');
    return;
  }
  const markerId = marker.options.image.markerId;
  const hiddenMarkerIds = [...user.hiddenMarkerIds];
  let message: string;
  if (hiddenMarkerIds.indexOf(markerId) === -1) {
    hiddenMarkerIds.push(markerId);
    message = 'Lore note is hidden';
  } else {
    hiddenMarkerIds.splice(hiddenMarkerIds.indexOf(markerId), 1);
    message = 'Lore note is not hidden anymore';
  }
  await notify(patchUser(user.username, { hiddenMarkerIds }), {
    success: message,
  });
  refreshUser();
};

const actions: {
  [type: string]: (
    marker: CanvasMarker,
    user: User | null,
    refreshUser: () => void
  ) => void;
} = {
  lore_note: hideMarker,
  glyph: hideMarker,
  chestsEliteAncient: respawnWorldAction(5),
  chestsEliteSupplies: respawnWorldAction(5),
  chestsLargeAlchemy: respawnAction(3600),
  chestsLargeAncient: respawnAction(3600),
  chestsLargeProvisions: respawnAction(3600),
  chestsLargeSupplies: respawnAction(3600),
  chestsMediumAlchemy: respawnAction(3600),
  chestsMediumAncient: respawnAction(3600),
  chestsMediumProvisions: respawnAction(3600),
  chestsMediumSupplies: respawnAction(3600),
  chestsCommonAncient: respawnAction(3600),
  chestsCommonProvisions: respawnAction(3600),
  chestsCommonSupplies: respawnAction(3600),
  chestsOffering: respawnAction(3600),
  chestsEliteOffering: respawnWorldAction(5),
  glyphChest: respawnWorldAction(4),
  gold: respawnSizeAction([0, 720, 900, 1020, 0]),
  iron: respawnSizeAction([0, 720, 900, 1020, 0]),
  lodestone: respawnSizeAction([0, 1080, 1350, 1530, 0]),
  oil: respawnSizeAction([0, 720, 900, 1020, 0]),
  orichalcum: respawnSizeAction([0, 720, 900, 1020, 0]),
  platinum: respawnSizeAction([0, 720, 900, 1020, 0]),
  saltpeter: respawnSizeAction([0, 540, 710, 885, 0]),
  silver: respawnSizeAction([0, 720, 900, 1020, 0]),
  starmetal: respawnSizeAction([0, 720, 900, 1020, 0]),
  ironwood: respawnSizeAction([900, 1080, 1350, 1530, 1800]),
  wyrdwood: respawnSizeAction([1200, 1440, 1800, 2040, 2400]),
  azoth_spring: respawnAction(600),
  fungus: respawnAction(600),
  hemp: respawnSizeAction([0, 720, 900, 1020, 0]),
  herb: respawnSizeAction([0, 720, 900, 1020, 0]),
  silkweed: respawnSizeAction([0, 720, 900, 1020, 0]),
  wirefiber: respawnSizeAction([0, 720, 900, 1020, 0]),
  barley: respawnAction(600),
  berry: respawnAction(600),
  blueberry: respawnAction(600),
  broccoli: respawnAction(600),
  cabbage: respawnAction(600),
  carrot: respawnAction(600),
  corn: respawnAction(600),
  cranberry: respawnAction(600),
  honey: respawnAction(600),
  milk: respawnAction(600),
  nuts: respawnAction(600),
  potato: respawnAction(600),
  pumpkin: respawnAction(600),
  squash: respawnAction(600),
  strawberry: respawnAction(600),
  turkey_nest: respawnAction(600),
  essences_shockbulb: respawnAction(600),
  essences_shockspire: respawnAction(600),
  essences_lightning_beetle: respawnAction(600),
  essences_blightroot: respawnAction(600),
  essences_blightcrag: respawnAction(600),
  essences_blightmoth: respawnAction(600),
  essences_earthspine: respawnAction(600),
  essences_earthcrag: respawnAction(600),
  essences_earthshell_turtle: respawnAction(600),
  essences_dragonglory: respawnAction(600),
  essences_scorchstone: respawnAction(600),
  essences_salamander_snail: respawnAction(600),
  essences_lifebloom: respawnAction(600),
  essences_lifejewel: respawnAction(600),
  essences_lifemoth: respawnAction(600),
  essences_soulsprout: respawnAction(600),
  essences_soulspire: respawnAction(600),
  essences_soulwyrm: respawnAction(600),
  essences_rivercress: respawnAction(600),
  essences_springstone: respawnAction(600),
  essences_floating_spinefish: respawnAction(600),
  pigment_black_primsabloom: respawnAction(600),
  pigment_blue_primsabloom: respawnAction(600),
  pigment_brown_primsabloom: respawnAction(600),
  pigment_cyan_primsabloom: respawnAction(600),
  pigment_green_primsabloom: respawnAction(600),
  pigment_magenta_primsabloom: respawnAction(600),
  pigment_orange_primsabloom: respawnAction(600),
  pigment_red_primsabloom: respawnAction(600),
  pigment_turquoise_primsabloom: respawnAction(600),
  pigment_violet_primsabloom: respawnAction(600),
  pigment_white_primsabloom: respawnAction(600),
  pigment_yellow_primsabloom: respawnAction(600),
  fish_hotspot1: respawnAction(1800),
  fish_hotspot2: respawnAction(2700),
  fish_hotspot3: respawnAction(5400),
  boss: respawnAction(5400),
  bossElite: respawnAction(21600),
};

export const getAction = (type: string) => {
  return actions[type];
};
