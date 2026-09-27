import { describe, expect, it } from 'vitest';
import { formatTime, progressPercent } from './time';

describe('time utilities', () => {
  it('formats playback time', () => {
    expect(formatTime(85_500)).toBe('1:25');
    expect(formatTime(-100)).toBe('0:00');
  });

  it('clamps progress math', () => {
    expect(progressPercent(50, 100)).toBe(50);
    expect(progressPercent(200, 100)).toBe(100);
    expect(progressPercent(10, 0)).toBe(0);
  });
});
