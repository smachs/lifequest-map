# aeternum-map-realtime

Client library for Aeternum Map's live location sharing

## Usage

See [StackBlitz](https://stackblitz.com/edit/aeternum-map-realtime?file=src%2Fmain.ts) for an example.

```js
import { servers, init } from 'aeternum-map-realtime';

// `servers` is an array of all available servers
const europeServer = servers.find((server) => server.name === 'Europe');

const { destroy } = init({
  // Select one of the official servers or run your own
  serverUrl: europeServer.url,
  // You generate this token in the Overwolf app
  token: 'TOKEN_FROM_OVERWOLF_APP',
  // Fired, on start and everytime a user is joined or left
  onGroup: (group) => console.log(group),
  // Includes updates for a player
  onPlayer: (partialPlayer) => console.log(partialPlayer),
  // Fired, if a player uses an hotkey in-game
  onHotkey: (steamId, hotkey) => console.log(steamId, hotkey),
  // The connection to the server established
  onConnect: () => console.log('Connected'),
});

// Call `destory` if you like to end the connection
destroy();
```

## Aeternum Map

Aeternum Map is a New World map companion, available on https://www.overwolf.com/app/Leon_Machens-Aeternum_Map and https://aeternum-map.gg.

## License

MIT
