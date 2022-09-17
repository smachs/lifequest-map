# @lmachens/aeternum-map-realtime

Client library for Aeternum Map's live location sharing

## Usage

```js
const { destroy } = init({
  serverUrl: 'wss://live1.aeternum-map.gg',
  token: 'TOKEN_FROM_OVERWOLF_APP',
  onStatus: (group) => console.log(group),
  onData: (partialPlayer) => console.log(partialPlayer),
  onHotkey: (steamId, hotkey) => console.log(steamId, hotkey),
  onConnect: () => console.log('Connected'),
});
```

## Aeternum Map

Aeternum Map is a New World map companion, available on https://www.overwolf.com/app/Leon_Machens-Aeternum_Map and https://aeternum-map.gg.

## License

MIT
