import { TileGrid } from '../../libraries/H5UI/TileGrid.js';

export class HUD {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oHUD = new TileGrid();
        this.oHUD.setGridSize(20, 2);
        this.printTile(this.POSITIONS.life.x + this.POSITIONS.life.pad, this.POSITIONS.life.y, this.TILE_HEART);
        this.printTile(this.POSITIONS.energy.x + this.POSITIONS.energy.pad, this.POSITIONS.energy.y, this.TILE_CRYSTAL);
        this.printTile(this.POSITIONS.food.x + this.POSITIONS.food.pad, this.POSITIONS.food.y, this.TILE_PORKCHOP);
        this.printTile(this.POSITIONS.genkeys.x + this.POSITIONS.genkeys.pad, this.POSITIONS.genkeys.y, this.TILE_KEY_IRON);
        this.printKeys(0)
    }

    setTiles(oImage) {
        this.oHUD._oTexture = oImage;
        this.oHUD.invalidate()
    }

    setRenderCanvas(oCanvas) {
        this.oCanvas = oCanvas;
        this.oContext = oCanvas.getContext('2d')
    }

    printTile(x, y, n) {
        this.oHUD.setCell(x, y, n)
    }

    printInt(x, y, n) {
        const a = [];
        do {
            a.push((n % 10) + this.TILE_ZERO);
            n = n / 10 | 0
        } while (n > 0);
        a.reverse();
        const l = a.length;
        for (let i = 0; i < l; i++) {
            this.printTile(x++, y, a[i])
        }
        return l
    }

    printLeftInt(x, y, n) {
        do {
            this.printTile(x--, y, (n % 10) + this.TILE_ZERO);
            n = n / 10 | 0
        } while (n > 0)
    }

    printBlank(x, y, n) {
        for (let i = 0; i < n; i++) {
            this.oHUD.setCell(x++, y, this.TILE_VOID)
        }
    }

    printPadInt(x, y, n, p) {
        this.printBlank(x, y, p);
        this.printLeftInt(x + p - 1, y, n)
    }

    printLife(n) {
        this.printPadInt(this.POSITIONS.life.x, this.POSITIONS.life.y, Math.min(this.POSITIONS.energy.max, Math.max(0, n)), this.POSITIONS.life.pad)
    }

    printEnergy(n) {
        this.printPadInt(this.POSITIONS.energy.x, this.POSITIONS.energy.y, Math.min(this.POSITIONS.energy.max, Math.max(0, n)), this.POSITIONS.energy.pad)
    }

    printFood(nFoodPoints, nFoodMax) {
        if (nFoodPoints >= nFoodMax) {
            this.TILE_ZERO = this.TILE_ZERO_GREEN
        }
        this.printPadInt(this.POSITIONS.food.x, this.POSITIONS.food.y, Math.min(this.POSITIONS.food.max, Math.max(0, nFoodPoints)), this.POSITIONS.food.pad);
        this.TILE_ZERO = this.TILE_ZERO_WHITE
    }

    printKeys(nKeys) {
        this.printTile(this.POSITIONS.keys.x, this.POSITIONS.keys.y, (nKeys & 1) ? this.TILE_KEY_RED : this.TILE_KEY_NONE);
        this.printTile(this.POSITIONS.keys.x + 1, this.POSITIONS.keys.y, (nKeys & 2) ? this.TILE_KEY_BLUE : this.TILE_KEY_NONE);
        this.printTile(this.POSITIONS.keys.x + 2, this.POSITIONS.keys.y, (nKeys & 4) ? this.TILE_KEY_GREEN : this.TILE_KEY_NONE);
        this.printTile(this.POSITIONS.keys.x + 3, this.POSITIONS.keys.y, (nKeys & 8) ? this.TILE_KEY_YELLOW : this.TILE_KEY_NONE)
    }

    printGenericKeys(nKeys) {
        this.printPadInt(this.POSITIONS.genkeys.x, this.POSITIONS.genkeys.y, nKeys, 2)
    }

    clear() {
        this.oContext.clearRect(0, 0, this.oCanvas.width, this.oCanvas.height)
    }

    render() {
        if (this.oHUD._bInvalid) {
            this.oHUD.render();
            this.oContext.drawImage(this.oHUD._oCanvas, 0, 0, this.oHUD._nWidth, this.oHUD._nHeight, 0, 0, (this.oHUD._nWidth << 1), (this.oHUD._nHeight << 1))
        }
    }
}
Object.assign(HUD.prototype, {
    oCanvas: null,
    oContext: null,
    oHUD: null,
    POSITIONS: {
        life: {
            x: 0,
            y: 0,
            max: 999,
            pad: 3
        },
        energy: {
            x: 0,
            y: 1,
            max: 999,
            pad: 3
        },
        food: {
            x: 5,
            y: 0,
            max: 999,
            pad: 3
        },
        keys: {
            x: 11,
            y: 1,
            max: 0,
            pad: 0
        },
        genkeys: {
            x: 6,
            y: 1,
            max: 99,
            pad: 2
        }
    },
    TILE_VOID: 0,
    TILE_ZERO: 1,
    TILE_KEY_COPPER: 11,
    TILE_KEY_IRON: 12,
    TILE_KEY_YELLOW: 13,
    TILE_KEY_BLUE: 15,
    TILE_KEY_RED: 14,
    TILE_KEY_GREEN: 16,
    TILE_KEY_NONE: 17,
    TILE_HEART: 18,
    TILE_CRYSTAL: 19,
    TILE_PORKCHOP: 20,
    TILE_ZERO_WHITE: 1,
    TILE_ZERO_GREEN: 21,
    TILE_ZERO_RED: 31,
    TILE_ZERO_YELLOW: 41
});
