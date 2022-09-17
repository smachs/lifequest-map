import { io } from 'socket.io-client';
import Peer from 'peerjs';
import type { Group, Player } from './types.js';

export const init = ({
  serverUrl,
  token,
  onGroup,
  onPlayer,
  onHotkey,
  onConnect,
}: {
  serverUrl: string;
  token: string;
  onGroup: (group: Group) => void;
  onPlayer: (data: Partial<Player>) => void;
  onHotkey: (steamId: string, hotkey: string) => void;
  onConnect: () => void;
}) => {
  const socket = io(serverUrl, {
    query: {
      token,
    },
    upgrade: false,
    transports: ['websocket'],
  });

  socket.emit('status', onGroup);
  socket.on('status', onGroup);

  const peerConnectedSteamIds: string[] = [];

  socket.on('data', (data: Partial<Player>) => {
    if (!data.steamId || peerConnectedSteamIds.includes(data.steamId)) {
      return;
    }
    onPlayer(data);
  });

  socket.on('hotkey', onHotkey);

  let peer: Peer | null = null;
  socket.on('connect', () => {
    onConnect();

    peer = new Peer(socket.id.replace(/[^a-zA-Z ]/g, ''), {
      debug: 2,
    });
    peer.on('error', (error) => {
      console.error('Peer error', error);
    });
    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });
    peer.on('connection', (conn) => {
      let connSteamId: string | null = null;
      conn.on('open', () => {
        console.log('Peer opened');
        socket.emit('status', onGroup);
      });

      conn.on('error', (error) => {
        console.log('Peer error', error);
      });

      conn.on('close', () => {
        console.log('Peer closed');
        if (connSteamId) {
          const index = peerConnectedSteamIds.indexOf(connSteamId);
          if (index !== -1) {
            peerConnectedSteamIds.splice(index, 1);
          }
        }
      });

      // @ts-ignore
      conn.on('data', (data: { group: Group } & Partial<Player>) => {
        if (data.group) {
          onGroup(data.group);
          return;
        }
        if (data.steamId && !peerConnectedSteamIds.includes(data.steamId)) {
          peerConnectedSteamIds.push(data.steamId);
          connSteamId = data.steamId;
        }

        onPlayer(data as Partial<Player>);
      });
    });
  });

  return {
    destroy: () => {
      socket.off('connect');
      socket.off('update');
      socket.off('hotkey');
      peer?.destroy();

      socket.close();
    },
  };
};
