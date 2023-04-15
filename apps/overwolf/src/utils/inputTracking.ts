export const W_KEY = '87';
export const A_KEY = '65';
export const S_KEY = '83';
export const D_KEY = '68';
export const SPACE_KEY = '32';

const keysDown = {
  [W_KEY]: false,
  [A_KEY]: false,
  [S_KEY]: false,
  [D_KEY]: false,
  [SPACE_KEY]: false,
};
export type MOVEMENT =
  | 'forward'
  | 'backward'
  | 'left'
  | 'right'
  | 'forward_left'
  | 'forward_right'
  | 'backward_left'
  | 'backward_right'
  | 'none';

let isJumping = false;
let jumpingTimeout: NodeJS.Timeout | undefined = undefined;
export function listenToMovement(
  callback: (movement: MOVEMENT, isJumping: boolean) => void
) {
  function calculateMovement() {
    let movement: MOVEMENT = 'none';
    if (keysDown[W_KEY] && !keysDown[S_KEY]) {
      if (keysDown[A_KEY]) {
        movement = 'forward_left';
      } else if (keysDown[D_KEY]) {
        movement = 'forward_right';
      } else {
        movement = 'forward';
      }
    } else if (keysDown[S_KEY] && !keysDown[W_KEY]) {
      if (keysDown[A_KEY]) {
        movement = 'backward_left';
      } else if (keysDown[D_KEY]) {
        movement = 'backward_right';
      } else {
        movement = 'backward';
      }
    } else if (keysDown[A_KEY] && !keysDown[D_KEY]) {
      movement = 'left';
    } else if (keysDown[D_KEY] && !keysDown[A_KEY]) {
      movement = 'right';
    }

    callback(movement, isJumping);
  }

  function handleKeyDown(info: overwolf.games.inputTracking.KeyEvent) {
    if (
      info.onGame &&
      (info.key === W_KEY ||
        info.key === A_KEY ||
        info.key === S_KEY ||
        info.key === D_KEY ||
        info.key === SPACE_KEY)
    ) {
      keysDown[info.key] = true;
      if (info.key === SPACE_KEY) {
        isJumping = true;
        clearTimeout(jumpingTimeout);
        jumpingTimeout = setTimeout(() => {
          isJumping = false;
          calculateMovement();
        }, 1000);
      }
      calculateMovement();
    }
  }
  function handleKeyUp(info: overwolf.games.inputTracking.KeyEvent) {
    if (
      info.onGame &&
      (info.key === W_KEY ||
        info.key === A_KEY ||
        info.key === S_KEY ||
        info.key === D_KEY ||
        info.key === SPACE_KEY)
    ) {
      keysDown[info.key] = false;
      calculateMovement();
    }
  }
  overwolf.games.inputTracking.onKeyDown.addListener(handleKeyDown);
  overwolf.games.inputTracking.onKeyUp.addListener(handleKeyUp);

  return () => {
    overwolf.games.inputTracking.onKeyDown.removeListener(handleKeyDown);
    overwolf.games.inputTracking.onKeyUp.removeListener(handleKeyUp);
  };
}
