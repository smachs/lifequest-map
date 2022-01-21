import leaflet from 'leaflet';

export const createPlayerIcon = (color = '#A7A7A7') =>
  leaflet.divIcon({
    html: `
    <svg style="filter: drop-shadow(0px 0px 5px rgb(0 0 0)) drop-shadow(0px 0px 5px rgb(0 0 0))" width="32px" height="32px" viewBox="0 0 48 48"><g stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path clip-rule="evenodd" fill="none" stroke="${color}" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20z"/><path fill="#FEFEFE" stroke="#FEFEFE" d="M24 13l-7 21l7-5l7 5l-7-21z"/></g></svg>
    `,
    className: '',
    iconSize: [32, 32],
    tooltipAnchor: [0, -20],
  });
