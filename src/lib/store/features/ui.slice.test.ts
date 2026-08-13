import { describe, expect, it } from 'vitest';

import type { Bounds } from '@/lib/types';

import { selectShop, setBounds, toggleShop, uiReducer } from './ui.slice';

const initial = uiReducer(undefined, { type: 'init' });
const box: Bounds = [28.5, -101.5, 34.4, -92.9];

describe('ui slice', () => {
  it('stores bounds', () => {
    expect(uiReducer(initial, setBounds(box)).bounds).toEqual(box);
  });

  it('keeps the same reference when bounds do not change', () => {
    const settled = uiReducer(initial, setBounds(box));
    // Identical bounds must be a no-op so RTK Query does not refetch.
    expect(uiReducer(settled, setBounds([...box]))).toBe(settled);
  });

  it('selects and clears a shop', () => {
    const selected = uiReducer(initial, selectShop('deep-ellum-electric'));
    expect(selected.selectedSlug).toBe('deep-ellum-electric');
    expect(uiReducer(selected, selectShop(null)).selectedSlug).toBeNull();
  });

  it('toggles a shop off when already selected', () => {
    const selected = uiReducer(initial, toggleShop('deep-ellum-electric'));
    expect(selected.selectedSlug).toBe('deep-ellum-electric');
    expect(
      uiReducer(selected, toggleShop('deep-ellum-electric')).selectedSlug,
    ).toBeNull();
    expect(uiReducer(selected, toggleShop('other')).selectedSlug).toBe('other');
  });
});
