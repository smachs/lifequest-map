import { notifications } from '@mantine/notifications';
import leaflet from 'leaflet';
import type { Socket } from 'socket.io-client';
import type { MarkerSize } from 'static';
import { getWorld, getZone } from 'static';
import { notify } from '../../utils/notifications';
import { usePlayerStore } from '../../utils/playerStore';
import { useUserStore } from '../../utils/userStore';
import { patchUser } from '../MarkerDetails/api';
import type CanvasMarker from './CanvasMarker';
import styles from './WorldMap.module.css';
import { latestLeafletMap } from './useWorldMap';

const format = (value: number) => `0${Math.floor(value)}`.slice(-2);
const formatTimer = (seconds: number) => {
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  if (hours >= 1) {
    return [hours, minutes, seconds % 60].map(format).join(':');
  }
  return [minutes, seconds % 60].map(format).join(':');
};

export const startTimer = (
  marker: CanvasMarker,
  respawnTimer: number,
  socket?: Socket | null
) => {
  if (respawnTimer < 1) {
    return;
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

  const respawnAt = respawnTimer + Date.now();
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

  const { worldName, steamId } = usePlayerStore.getState().player || {};
  if (socket && worldName && steamId) {
    socket.emit(
      'markerRespawnAt',
      marker.options.image.markerId,
      respawnTimer,
      worldName,
      steamId,
      marker.options.image.type
    );
  }
};

const respawnAction = (typeRespawnTimer?: number) => (marker: CanvasMarker) => {
  let respawnTimer = marker.customRespawnTimer || typeRespawnTimer;
  if (!respawnTimer) {
    return 0;
  }
  respawnTimer *= 1000;
  return respawnTimer;
};

const respawnWorldAction = (respawnHour: number) => () => {
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

  const respawnTimer =
    1000 * secondsLeft + 60000 * minutesLeft + 3600000 * hoursLeft;
  return respawnTimer;
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
      return 0;
    }
    const size = sizes[marker.options.image.markerSize];
    const timer = timers[size];
    return respawnAction(timer)(marker);
  };

const hideMarker = async (marker: CanvasMarker) => {
  const { user, refreshUser } = useUserStore.getState();
  if (!user) {
    notifications.show({
      message: 'User not detected. Make sure to run Overwolf before New World.',
      color: 'yellow',
    });
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
  [type: string]: (marker: CanvasMarker) => Promise<void> | number;
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
  chestsEliteBeast: respawnWorldAction(5),
  chestsEliteOffering: respawnWorldAction(5),
  glyphChest: respawnWorldAction(4),
  gypsum: respawnSizeAction([0, 64000, 64000, 64000, 0]),
  mythril: respawnSizeAction([0, 360, 450, 510, 0]),
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
  runewood: respawnSizeAction([600, 720, 900, 1020, 2040]),
  wyrdwood: respawnSizeAction([1200, 1440, 1800, 2040, 2400]),
  azoth_spring: respawnAction(600),
  bumbleblossom: respawnAction(1800),
  capped_tanglewisp: respawnAction(1800),
  cascaded_gillflower: respawnAction(1800),
  corrupted_bloodspore: respawnAction(1800),
  fronded_petalcap: respawnAction(1800),
  slimy_twistcap: respawnAction(1800),
  spinecap: respawnAction(1800),
  suncreeper: respawnAction(1800),
  tanglewisp: respawnAction(1800),
  tendrilspine: respawnAction(1800),
  toadpot: respawnAction(1800),
  void_pitcher: respawnAction(1800),
  warm_platecap: respawnAction(1800),
  weeping_shellbed: respawnAction(1800),
  hemp: respawnSizeAction([0, 720, 900, 1020, 0]),
  herb: respawnSizeAction([0, 720, 900, 1020, 0]),
  spinfiber: respawnSizeAction([0, 360, 450, 510, 0]),
  succulent: respawnSizeAction([0, 720, 900, 1020, 0]),
  silkweed: respawnSizeAction([0, 720, 900, 1020, 0]),
  wirefiber: respawnSizeAction([0, 720, 900, 1020, 0]),
  banana: respawnAction(900),
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
  essences_shockbulb: respawnAction(630),
  essences_shockspire: respawnAction(840),
  essences_lightning_beetle: respawnAction(1050),
  essences_blightroot: respawnAction(630),
  essences_blightcrag: respawnAction(840),
  essences_blightmoth: respawnAction(1050),
  essences_earthspine: respawnAction(630),
  essences_earthcrag: respawnAction(840),
  essences_earthshell_turtle: respawnAction(1050),
  essences_dragonglory: respawnAction(630),
  essences_scorchstone: respawnAction(840),
  essences_salamander_snail: respawnAction(1050),
  essences_lifebloom: respawnAction(630),
  essences_lifejewel: respawnAction(840),
  essences_lifemoth: respawnAction(1050),
  essences_soulsprout: respawnAction(630),
  essences_soulspire: respawnAction(840),
  essences_soulwyrm: respawnAction(1050),
  essences_rivercress: respawnAction(630),
  essences_springstone: respawnAction(840),
  essences_floating_spinefish: respawnAction(1050),
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
  pigment_white_primsabloom: respawnAction(900),
  pigment_yellow_primsabloom: respawnAction(600),
  fish_hotspot1: respawnAction(1800),
  fish_hotspot2: respawnAction(2700),
  fish_hotspot3: respawnAction(5400),
  boss: respawnAction(5400),
  bossElite: respawnAction(21600),
  winterWarrior: respawnAction(21600),
  rafflebones_25: respawnAction(5400),
  rafflebones_66: respawnAction(21600),
  wispybloom: respawnAction(180),
  sporePodAngryEarth: respawnAction(420),
  sporePodAncient: respawnAction(420),
  sporePodBeast: respawnAction(420),
  sporePodGeneric: respawnAction(420),
};

export const getAction = (type: string) => {
  return actions[type];
};

export const sharedRespawnTimers = [
  'mythril',
  'gold',
  'iron',
  'lodestone',
  'oil',
  'orichalcum',
  'platinum',
  'saltpeter',
  'silver',
  'starmetal',
  'ironwood',
  'runewood',
  'wyrdwood',
  'azoth_spring',
  'bumbleblossom',
  'capped_tanglewisp',
  'cascaded_gillflower',
  'corrupted_bloodspore',
  'fronded_petalcap',
  'slimy_twistcap',
  'spinecap',
  'suncreeper',
  'tanglewisp',
  'tendrilspine',
  'toadpot',
  'void_pitcher',
  'warm_platecap',
  'weeping_shellbed',
  'hemp',
  'herb',
  'spinfiber',
  'succulent',
  'silkweed',
  'wirefiber',
  'banana',
  'barley',
  'berry',
  'blueberry',
  'broccoli',
  'cabbage',
  'carrot',
  'corn',
  'cranberry',
  'honey',
  'milk',
  'nuts',
  'potato',
  'pumpkin',
  'squash',
  'strawberry',
  'turkey_nest',
  'essences_shockbulb',
  'essences_shockspire',
  'essences_lightning_beetle',
  'essences_blightroot',
  'essences_blightcrag',
  'essences_blightmoth',
  'essences_earthspine',
  'essences_earthcrag',
  'essences_earthshell_turtle',
  'essences_dragonglory',
  'essences_scorchstone',
  'essences_salamander_snail',
  'essences_lifebloom',
  'essences_lifejewel',
  'essences_lifemoth',
  'essences_soulsprout',
  'essences_soulspire',
  'essences_soulwyrm',
  'essences_rivercress',
  'essences_springstone',
  'essences_floating_spinefish',
  'pigment_black_primsabloom',
  'pigment_blue_primsabloom',
  'pigment_brown_primsabloom',
  'pigment_cyan_primsabloom',
  'pigment_green_primsabloom',
  'pigment_magenta_primsabloom',
  'pigment_orange_primsabloom',
  'pigment_red_primsabloom',
  'pigment_turquoise_primsabloom',
  'pigment_violet_primsabloom',
  'pigment_white_primsabloom',
  'pigment_yellow_primsabloom',
  'fish_hotspot1',
  'fish_hotspot2',
  'fish_hotspot3',
  'boss',
  'bossElite',
  'winterWarrior',
  'rafflebones_25',
  'rafflebones_66',
  'wispybloom',
];
