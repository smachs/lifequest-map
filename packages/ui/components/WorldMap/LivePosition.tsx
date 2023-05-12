import { useEffect } from 'react';
import { init } from 'realtime';
import type { Group, Player } from 'realtime/types';
import type { Socket } from 'socket.io-client';

export default function LivePosition({
  serverUrl,
  token,
  onSocket,
  onGroup,
  onPlayer,
  onHotkey,
}: {
  serverUrl: string;
  token: string;
  onSocket: (socket: Socket) => void;
  onGroup: (group: Group) => void;
  onPlayer: (player: Partial<Player>) => void;
  onHotkey: (steamId: string, hotkey: string) => void;
}) {
  useEffect(() => {
    const { destroy, socket } = init({
      serverUrl,
      token,
      onGroup,
      onPlayer,
      onHotkey,
      onConnect: () => console.log('Sharing live status 👌'),
    });
    onSocket(socket);

    return () => {
      destroy();
    };
  }, [token, serverUrl]);

  return <> </>;
}
