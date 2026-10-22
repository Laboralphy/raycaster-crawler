import { describe, it, expect, vi } from 'vitest';
import { Raycaster } from '../../../../src/libraries/Raycaster/Raycaster.js';

// le strict nécessaire de Raycaster pour pushSprite et drawSprite
function raycaster() {
    const animation = { base: 0 };
    return {
        yTexture: 96,
        TIME_FACTOR: 40,
        aSpritePool: [],
        nSpriteCount: 0,
        oCamera: { x: 0, y: 0 },
        getTileSet: () => ({}),
        oRenderer: {
            buildSprite: () => ({
                h: 0,
                buildAnimation: vi.fn(),
                setCurrentAnimation: vi.fn(),
                setTileSet: vi.fn(),
                getCurrentAnimation: () => animation
            })
        },
        pushSprite: Raycaster.prototype.pushSprite
    };
}

function mobile(nElevation) {
    return {
        x: 64, y: 0, fTheta: 0, bVisible: true,
        oSprite: {
            bVisible: true, bTranslucent: false, nFrame: 3, oOverlay: null,
            oBlueprint: { oTile: { nScale: 1 }, nFx: 0, nElevation },
            setDirection: vi.fn(), animate: vi.fn()
        }
    };
}

describe('Raycaster, sprites', () => {
    it('pushSprite : un sprite sans hauteur reste à hauteur des yeux', () => {
        const rc = raycaster();
        rc.pushSprite({ nScale: 1 }, 10, 20, 3, 0);
        expect(rc.aSpritePool[0].h).toBe(0);
    });

    it('drawSprite : la hauteur du plan place le centre du sprite au-dessus du sol', () => {
        const rc = raycaster();
        Raycaster.prototype.drawSprite.call(rc, mobile(24));
        // le centre d'un sprite est à mi-mur (48) : 24 au-dessus du sol, c'est 24 plus bas
        expect(rc.aSpritePool[0].h).toBe(-24);
    });

    it('un sprite réutilisé ne garde pas la hauteur du précédent', () => {
        const rc = raycaster();
        Raycaster.prototype.drawSprite.call(rc, mobile(24));
        rc.nSpriteCount = 0;
        Raycaster.prototype.drawSprite.call(rc, mobile(null));
        expect(rc.aSpritePool[0].h).toBe(0);
    });
});
