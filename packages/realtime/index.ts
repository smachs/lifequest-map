import { io } from 'socket.io-client';
import Peer from 'peerjs';
import type { Group, Player } from './types.js';

export const init = ({
  serverUrl,
  token,
  onStatus,
  onData,
  onHotkey,
  onConnect,
}: {
  serverUrl: string;
  token: string;
  onStatus: (group: Group) => void;
  onData: (data: Partial<Player>) => void;
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

  socket.emit('status', onStatus);
  socket.on('status', onStatus);

  const peerConnectedSteamIds: string[] = [];

  socket.on('data', (data: Partial<Player>) => {
    if (!data.steamId || peerConnectedSteamIds.includes(data.steamId)) {
      return;
    }
    onData(data);
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
        socket.emit('status', onStatus);
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

      conn.on('data', (data: { group?: Group; steamId?: string }) => {
        if (data.group) {
          onStatus(data.group);
          return;
        }
        if (data.steamId && !peerConnectedSteamIds.includes(data.steamId)) {
          peerConnectedSteamIds.push(data.steamId);
          connSteamId = data.steamId;
        }

        onData(data);
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
