import { describe, it, expect } from 'vitest';
import { Font } from '../../../../src-recovered/libraries/H5UI/Font.js';
import { assertDefaults } from '../../helpers.mjs';

// contrôle H5UI minimal : une surface 2D et un compteur d'invalidations
function control() {
    const oSurface = { font: '', fillStyle: '', strokeStyle: '' };
    return {
        oSurface,
        nInvalidated: 0,
        getSurface: () => oSurface,
        invalidate() {
            this.nInvalidated++;
        }
    };
}

describe('Font', () => {
    it('exige un contrôle', () => {
        expect(() => new Font()).toThrow(/no specified control/);
    });

    it('a des valeurs par défaut et les applique à la surface', () => {
        const c = control();
        const f = new Font(c);
        assertDefaults(f, {
            _sStyle: '', _sFont: 'monospace', _nFontSize: 10, _sColor: 'rgb(255, 255, 255)',
            _oControl: c, _sOutlineColor: 'rgb(0, 0, 0)', _bOutline: false
        });
        expect(c.oSurface).toEqual({ font: '10px monospace', fillStyle: 'rgb(255, 255, 255)', strokeStyle: '' });
        expect(c.nInvalidated).toBe(1);
    });

    it('getFontString inclut le style s\'il y en a un', () => {
        const f = new Font(control());
        f.setFont('serif');
        f.setSize(14);
        expect(f.getFontString()).toBe('14px serif');
        f.setStyle('bold');
        expect(f.getFontString()).toBe('bold 14px serif');
    });

    it('n\'invalide le contrôle que si la valeur change', () => {
        const c = control();
        const f = new Font(c);
        f.setFont('monospace');
        f.setSize(10);
        f.setStyle('');
        expect(c.nInvalidated).toBe(1);
        f.setSize(12);
        expect(c.nInvalidated).toBe(2);
        expect(c.oSurface.font).toBe('12px monospace');
    });

    it('setColor gère le contour', () => {
        const c = control();
        const f = new Font(c);
        f.setColor('#F00', '#00F');
        expect(f._bOutline).toBe(true);
        expect(c.oSurface.fillStyle).toBe('#F00');
        expect(c.oSurface.strokeStyle).toBe('#00F');
        f.setColor('#F00');
        expect(f._bOutline).toBe(false);
    });

    it('setControl change de surface', () => {
        const f = new Font(control());
        const c2 = control();
        f.setControl(c2);
        expect(f._oControl).toBe(c2);
        expect(c2.oSurface.font).toBe('10px monospace');
    });
});
