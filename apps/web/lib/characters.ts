export async function getCharacters() {
  const response = await fetch('https://live1.aeternum-map.gg/api/live');
  return response.json();
}
