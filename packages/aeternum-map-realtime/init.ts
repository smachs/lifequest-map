import Peer from 'peerjs';
import { io } from 'socket.io-client';
import type { Group, Player } from './types.js';

export const init = ({
  serverUrl,
  token,
  onGroup,
  onPlayer,
  onHotkey,
  onConnect,
  peerToPeer = true,
}: {
  serverUrl: string;
  token: string;
  onGroup: (group: Group) => void;
  onPlayer: (data: Partial<Player>) => void;
  onHotkey: (steamId: string, hotkey: string) => void;
  onConnect: () => void;
  peerToPeer?: boolean;
}) => {
  const socket = io(serverUrl, {
    query: {
      token,
    },
    transports: ['websocket'],
  });
  const peerConnectedSteamIds: string[] = [];
  let peer: Peer | null = null;

  socket.emit('status', onGroup);
  socket.on('status', onGroup);
  socket.on('data', (data: Partial<Player>) => {
    if (!data.steamId || peerConnectedSteamIds.includes(data.steamId)) {
      return;
    }
    onPlayer(data);
  });
  socket.on('hotkey', onHotkey);

  socket.on('connect', () => {
    onConnect();
    if (peer) {
      peer.destroy();
    }
    if (peerToPeer) {
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
              socket.emit('peer:off', connSteamId);
            }
            connSteamId = null;
          }
        });

        // @ts-ignore
        conn.on('data', (data: { group: Group } & Partial<Player>) => {
          if (data.group) {
            onGroup(data.group);
          }
          if (data.steamId) {
            if (!peerConnectedSteamIds.includes(data.steamId)) {
              peerConnectedSteamIds.push(data.steamId);
              connSteamId = data.steamId;
              socket.emit('peer:on', data.steamId);
            }

            onPlayer(data as Partial<Player>);
          }
        });
      });

      peer.on('disconnected', () => {
        console.log('Peer disconnected -> reconnecting');
        peer?.reconnect();
      });
    }
  });

  return {
    socket,
    destroy: () => {
      socket.off('connect');
      socket.off('update');
      socket.off('hotkey');
      peer?.destroy();

      socket.close();
    },
  };
};
