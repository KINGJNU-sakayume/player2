import { describe, expect, it } from 'vitest';
import { parseLrc } from './LrclibLyricsProvider';

describe('LRC parsing', () => {
  it('parses, sorts, and bounds timestamped lines', () => {
    const lines = parseLrc('[00:12.50]Second\n[00:01.005]First\n[01:02]Third');
    expect(lines.map((line) => line.startMs)).toEqual([1005, 12500, 62000]);
    expect(lines[0].endMs).toBe(12500);
    expect(lines[2].endMs).toBeUndefined();
  });
  it('ignores metadata and empty lines', () => expect(parseLrc('[ar:Artist]\n[00:01.00]')).toEqual([]));
});
