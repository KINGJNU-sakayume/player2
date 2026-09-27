import { describe, expect, it } from 'vitest';
import { interpolatePosition } from './useInterpolatedPosition';

const snapshot = { track: null, positionMs: 2_000, durationMs: 10_000, paused: false, updatedAt: 1_000 };
describe('playback position interpolation', () => {
  it('advances and clamps playing state', () => expect(interpolatePosition(snapshot, 20_000)).toBe(10_000));
  it('does not advance paused state', () => expect(interpolatePosition({ ...snapshot, paused: true }, 5_000)).toBe(2_000));
  it('resets from each authoritative snapshot', () => expect(interpolatePosition({ ...snapshot, positionMs: 500, updatedAt: 5_000 }, 5_000)).toBe(500));
});
