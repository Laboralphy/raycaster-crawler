import { describe, it, expect } from 'vitest';
import { Point } from '../../../../../src/libraries/O876/Astar/Point.js';
import { assertDefaults } from '../../../helpers.mjs';

describe('Point', () => {
    it('garde ses coordonnées', () => {
        assertDefaults(new Point(3, -4), { x: 3, y: -4 });
    });
});
