import { describe, expect, it } from 'vitest';

import { parseBounds } from './bounds';

describe('parseBounds', () => {
  it('parses a well-formed box', () => {
    expect(parseBounds('28.5,-101.5,34.4,-92.9')).toEqual([
      28.5, -101.5, 34.4, -92.9,
    ]);
  });

  it('returns null for missing input', () => {
    expect(parseBounds(null)).toBeNull();
    expect(parseBounds('')).toBeNull();
  });

  it('rejects the wrong number of parts', () => {
    expect(parseBounds('1,2,3')).toBeNull();
    expect(parseBounds('1,2,3,4,5')).toBeNull();
  });

  it('rejects non-numeric parts', () => {
    expect(parseBounds('a,2,3,4')).toBeNull();
    expect(parseBounds('1,2,3,Infinity')).toBeNull();
    expect(parseBounds('1,2,3,NaN')).toBeNull();
  });

  it('rejects an inverted box', () => {
    expect(parseBounds('34.4,-101.5,28.5,-92.9')).toBeNull(); // lat flipped
    expect(parseBounds('28.5,-92.9,34.4,-101.5')).toBeNull(); // lng flipped
  });
});
