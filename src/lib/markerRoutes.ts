import type { Collection } from 'mongodb';
import { getCollection } from './db';
import type { MarkerRoute } from '../types';

export function getMarkerRoutesCollection(): Collection<MarkerRoute> {
  return getCollection<MarkerRoute>('marker-routes');
}
