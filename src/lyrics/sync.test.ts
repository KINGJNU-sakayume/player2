import { describe, expect, it } from 'vitest';
import { getLyricWindow } from './sync';

const lines = [
  { startMs: 0, endMs: 1000, text: 'one' },
  { startMs: 1000, endMs: 2000, text: 'two' },
  { startMs: 2000, endMs: 3000, text: 'three' },
];

describe('getLyricWindow', () => {
  it('returns current and next two lines', () => {
    expect(getLyricWindow(lines, 1200)).toMatchObject({
      current: { text: 'two' },
      next: { text: 'three' },
      secondNext: null,
    });
  });

  it('does not duplicate the final line', () => {
    const result = getLyricWindow(lines, 2500);
    expect(result.current?.text).toBe('three');
    expect(result.next).toBeNull();
    expect(result.secondNext).toBeNull();
  });
});
