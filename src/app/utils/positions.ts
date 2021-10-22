export function calcDistance(
  pointA: [number, number],
  pointB: [number, number]
): number {
  const dx = pointA[0] - pointB[0];
  const dy = pointA[1] - pointB[1];
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}
