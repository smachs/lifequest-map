import type CanvasMarker from './CanvasMarker';

export function updateRotation(markers: CanvasMarker[], rotate: number) {
  if (markers.length === 0) {
    return;
  }
  // @ts-ignore
  markers[0]._renderer._clear();
  markers.forEach((marker) => {
    marker.options.image.rotate = rotate;
    marker.redraw();
  });
}
